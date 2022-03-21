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
	v1 "gitlab.com/go-prism/prism3/core/internal/api/v1"
	"gitlab.com/go-prism/prism3/core/internal/db"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph"
	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/internal/storage"
	"net/http"
	"time"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  logging.Config

	DB struct {
		DSN string `split_words:"true" required:"true"`
	}
	S3 storage.S3Options
}

func main() {
	var e environment
	if err := envconfig.Process("prism", &e); err != nil {
		log.WithError(err).Fatal("failed to read environment")
		return
	}
	logging.Init(&e.Log)

	// configure database
	database, err := db.NewDatabase(e.DB.DSN)
	if err != nil {
		log.WithError(err).Fatal("failed to setup database layer")
		return
	}
	if err := database.Init(); err != nil {
		log.WithError(err).Fatal("failed to initialise database")
		return
	}
	repos := repo.NewRepos(database.DB())
	s3, err := storage.NewS3(context.Background(), e.S3)
	if err != nil {
		log.WithError(err).Fatal("failed to connect to object storage")
		return
	}

	// configure graphql
	h := v1.NewGateway(resolver.NewResolver(repos, s3))
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: graph.NewResolver(repos)}))
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

	// configure routing
	router := mux.NewRouter()
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	router.Handle("/api/graphql", playground.Handler("GraphQL Playground", "/api/query"))
	router.Handle("/api/query", srv)
	router.PathPrefix("/api/v1/{bucket}/").
		Handler(h).
		Methods(http.MethodGet)

	// start serving
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(false).
		Run()
}
