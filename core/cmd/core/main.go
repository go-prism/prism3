/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package main

import (
	"context"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/djcass44/go-utils/flagging"
	"github.com/djcass44/go-utils/logging"
	"github.com/djcass44/go-utils/otel"
	"github.com/djcass44/go-utils/otel/metrics"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/hibiken/asynq"
	"github.com/kelseyhightower/envconfig"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/av1o/cap10/pkg/verify"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	v1 "gitlab.com/go-prism/prism3/core/internal/api/v1"
	"gitlab.com/go-prism/prism3/core/internal/graph"
	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/permissions"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/db/notify"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/errtack"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	stdlog "log"
	"net/http"
	"net/url"
	"os"
	"time"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  struct {
		Level int `split_words:"true"`
	}

	PublicURL string `split_words:"true" required:"true"`

	Auth struct {
		SuperUser string `split_words:"true"`
	}
	DB struct {
		DSN        string `split_words:"true" required:"true"`
		DSNReplica string `split_words:"true"`
	}
	S3  storage.S3Options
	Dev struct {
		Handlers bool `split_words:"true" default:"true"`
	}
	Flag   flag.Options
	Sentry errtack.Options

	Plugin struct {
		GoURL   string `split_words:"true"`
		RbacURL string `split_words:"true" required:"true"`
	}
	Redis struct {
		Addr     string `split_words:"true" required:"true"`
		Password string `split_words:"true"`
	}
	Otel tracing.OtelOptions
}

func main() {
	var e environment
	if err := envconfig.Process("prism", &e); err != nil {
		stdlog.Fatalf("failed to read environment: %s", err)
		return
	}
	// configure logging
	zc := zap.NewProductionConfig()
	zc.Level = zap.NewAtomicLevelAt(zapcore.Level(e.Log.Level * -1))
	log, ctx := logging.NewZap(context.TODO(), zc)

	flagging.Build(ctx, flagging.Options{
		Token: e.Flag.Token,
		Name:  e.Flag.Name,
		URL:   e.Flag.URL,
		Env:   e.Flag.Env,
	})

	// setup sentry
	if e.Sentry.DSN != "" {
		log.V(1).Info("enabling Sentry")
		_ = errtack.Init(ctx, e.Sentry)
	}

	// setup otel
	err := otel.Build(ctx, otel.Options{
		Enabled:       e.Otel.Enabled,
		ServiceName:   tracing.ServiceNameCore,
		Environment:   e.Otel.Environment,
		KubeNamespace: os.Getenv("KUBE_NAMESPACE"),
		SampleRate:    e.Otel.SampleRate,
	})
	if err != nil {
		log.Error(err, "failed to setup tracing")
		os.Exit(1)
		return
	}

	prom, err := metrics.New(ctx, nil, true)
	if err != nil {
		log.Error(err, "failed to setup metrics")
		os.Exit(1)
		return
	}

	// configure database
	database, err := db.NewDatabase(ctx, e.DB.DSN, e.DB.DSNReplica)
	if err != nil {
		log.Error(err, "failed to setup database layer")
		os.Exit(1)
		return
	}
	if err := database.Init(); err != nil {
		log.Error(err, "failed to setup initialise database")
		os.Exit(1)
		return
	}
	notifier, err := notify.NewNotifier(ctx, database.DB(), e.DB.DSN, schemas.NotifyTables...)
	if err != nil {
		log.Error(err, "failed to initialise listeners")
		os.Exit(1)
		return
	}
	notifier.Listen()
	repos := repo.NewRepos(database.DB())
	s3, err := storage.NewS3(context.Background(), e.S3)
	if err != nil {
		log.Error(err, "failed to connect to object storage")
		os.Exit(1)
		return
	}

	var goProxyURL *url.URL
	if e.Plugin.GoURL != "" {
		log.V(1).Info("checking GoProxy URL", "Url", e.Plugin.GoURL)
		goProxyURL, err = url.Parse(e.Plugin.GoURL)
		if err != nil {
			log.Error(err, "failed to parse GoProxy URL")
			os.Exit(1)
			return
		}
	}

	batchClient := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     e.Redis.Addr,
		Password: e.Redis.Password,
	})

	log.V(1).Info("establishing connection to RBAC", "Url", e.Plugin.RbacURL)
	conn, err := grpc.Dial(e.Plugin.RbacURL, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithUnaryInterceptor(otelgrpc.UnaryClientInterceptor()), grpc.WithStreamInterceptor(otelgrpc.StreamClientInterceptor()))
	if err != nil {
		log.Error(err, "failed to dial RBAC")
		os.Exit(1)
		return
	}
	rbacClient := rbac.NewAuthorityClient(conn)

	perms, err := permissions.NewManager(ctx, rbacClient, e.Auth.SuperUser)
	if err != nil {
		log.Error(err, "failed to setup permissions manager")
		os.Exit(1)
		return
	}

	// configure graphql
	h := v1.NewGateway(resolver.NewResolver(ctx, repos, s3, e.PublicURL), goProxyURL, repos.ArtifactRepo)
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: graph.NewResolver(repos, s3, batchClient, notifier, perms)}))
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				log.V(1).Info("validating websocket origin", "Origin", r.Header.Get("Origin"))
				return true
			},
		},
	})
	c := client.NewClient(verify.NewNoOpVerifier())

	// configure routing
	router := mux.NewRouter()
	router.Use(logging.Middleware(log), metrics.Middleware(), otelmux.Middleware(tracing.ServiceNameCore))
	router.Use(sentryhttp.New(sentryhttp.Options{Repanic: true}).Handle)
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	router.HandleFunc("/metrics", prom.ServeHTTP)
	router.Handle("/api/graphql", playground.Handler("GraphQL Playground", "/api/query"))
	router.Handle("/api/query", c.WithOptionalUser(srv))
	// generic
	router.PathPrefix("/api/v1/{bucket}/").
		HandlerFunc(h.ServeHTTPGeneric).
		Methods(http.MethodGet)
	// helm
	router.PathPrefix("/api/helm/{bucket}/").
		HandlerFunc(h.ServeHTTPHelm).
		Methods(http.MethodGet)
	// npm
	npmRouter := router.PathPrefix("/api/npm").Subrouter()
	h.RouteNPM(npmRouter)
	// pypi
	router.HandleFunc("/api/pypi/{bucket}/simple/{package}/", h.ServePyPi).
		Methods(http.MethodGet)
	// go
	router.PathPrefix("/api/go").HandlerFunc(h.ServeGo).
		Methods(http.MethodGet)

	// start serving
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(e.Dev.Handlers).
		WithLogger(log).
		Run()
}
