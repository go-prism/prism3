package main

import (
	"context"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/av1o/cap10-ingress/pkg/logging"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/av1o/cap10/pkg/verify"
	v1 "gitlab.com/go-prism/prism3/core/internal/api/v1"
	"gitlab.com/go-prism/prism3/core/internal/db"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph"
	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
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
	Flag flag.Options

	Plugin struct {
		GoURL string `split_words:"true"`
	}
}

func main() {
	var e environment
	if err := envconfig.Process("prism", &e); err != nil {
		log.WithError(err).Fatal("failed to read environment")
		return
	}
	logging.Init(&e.Log)
	flag.Init(e.Flag)

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

	// configure graphql
	h := v1.NewGateway(resolver.NewResolver(repos, s3, e.PublicURL), goProxyURL)
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: graph.NewResolver(repos, s3)}))
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
	router.HandleFunc("/api/npm/{bucket}/{package}", h.ServeHTTPNPM).
		Methods(http.MethodGet)
	router.HandleFunc("/api/npm/{bucket}/@{scope}/{package}", h.ServeHTTPNPM).
		Methods(http.MethodGet)
	router.HandleFunc("/api/npm/{bucket}/{package}/{version}", h.ServeHTTPNPM).
		Methods(http.MethodGet)
	router.HandleFunc("/api/npm/{bucket}/@{scope}/{package}/{version}", h.ServeHTTPNPM).
		Methods(http.MethodGet)
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
