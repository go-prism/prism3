package main

import (
	"context"
	"github.com/goproxy/goproxy"
	"github.com/gorilla/mux"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/av1o/cap10-ingress/pkg/logging"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/core/pkg/sre"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"gitlab.com/go-prism/prism3/goproxy/internal/cache"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	stdlog "log"
	"net/http"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  logging.Config

	S3  storage.S3Options
	Dev struct {
		Handlers bool `split_words:"true" default:"true"`
	}
	Flag flag.Options
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

	logger := log.New()
	s3, err := storage.NewS3(context.Background(), e.S3)
	if err != nil {
		log.WithError(err).Fatal("failed to connect to object storage")
		return
	}

	// setup otel
	if err := tracing.Init(&e.Otel); err != nil {
		log.WithError(err).Fatal("failed to setup tracing")
		return
	}
	log.AddHook(&sre.TraceHook{})

	// configure routing
	router := mux.NewRouter()
	router.Use(otelmux.Middleware(tracing.DefaultServiceName))
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	router.PathPrefix("/").Handler(&goproxy.Goproxy{
		Cacher:        cache.NewCacher(s3),
		ProxiedSUMDBs: nil,
		Transport:     nil,
		ErrorLogger:   stdlog.New(logger.WriterLevel(log.ErrorLevel), "", 0),
	})
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(e.Dev.Handlers).
		Run()
}
