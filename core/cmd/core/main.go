package main

import (
	"context"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/hibiken/asynq"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/av1o/cap10-ingress/pkg/logging"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/av1o/cap10/pkg/verify"
	v1 "gitlab.com/go-prism/prism3/core/internal/api/v1"
	"gitlab.com/go-prism/prism3/core/internal/graph"
	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/db/notify"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/errtack"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/sre"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	"net/http"
	"net/url"
	"time"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  logging.Config

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
		GoURL string `split_words:"true"`
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
		log.WithError(err).Fatal("failed to read environment")
		return
	}
	logging.Init(&e.Log)
	flag.Init(e.Flag)
	log.AddHook(&sre.UserHook{})

	// setup sentry
	if e.Sentry.DSN != "" {
		_ = errtack.Init(e.Sentry)
	}

	// setup otel
	if err := tracing.Init(&e.Otel); err != nil {
		log.WithError(err).Fatal("failed to setup tracing")
		return
	}
	log.AddHook(&sre.TraceHook{})

	// configure database
	database, err := db.NewDatabase(e.DB.DSN, e.DB.DSNReplica)
	if err != nil {
		log.WithError(err).Fatal("failed to setup database layer")
		return
	}
	if err := database.Init(e.Auth.SuperUser); err != nil {
		log.WithError(err).Fatal("failed to initialise database")
		return
	}
	notifier, err := notify.NewNotifier(database.DB(), e.DB.DSN, schemas.NotifyTables...)
	if err != nil {
		log.WithError(err).Fatal("failed to initialise listeners")
		return
	}
	notifier.Listen()
	repos := repo.NewRepos(database.DB())
	s3, err := storage.NewS3(context.Background(), e.S3)
	if err != nil {
		log.WithError(err).Fatal("failed to connect to object storage")
		return
	}

	var goProxyURL *url.URL
	if e.Plugin.GoURL != "" {
		goProxyURL, err = url.Parse(e.Plugin.GoURL)
		if err != nil {
			log.WithError(err).Fatal("failed to parse GoProxy URL")
			return
		}
	}

	batchClient := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     e.Redis.Addr,
		Password: e.Redis.Password,
	})

	// configure graphql
	h := v1.NewGateway(resolver.NewResolver(repos, s3, e.PublicURL), goProxyURL, repos.ArtifactRepo)
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: graph.NewResolver(repos, s3, batchClient, notifier)}))
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				log.WithContext(r.Context()).Infof("websocket origin: %s", r.Header.Get("Origin"))
				return true
			},
		},
	})
	c := client.NewClient(verify.NewNoOpVerifier())

	// configure routing
	router := mux.NewRouter()
	router.Use(sentryhttp.New(sentryhttp.Options{Repanic: true}).Handle)
	router.Use(otelmux.Middleware(tracing.DefaultServiceName))
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
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
		Run()
}
