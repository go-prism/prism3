package main

import (
	"github.com/goproxy/goproxy"
	"github.com/gorilla/mux"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/av1o/cap10-ingress/pkg/logging"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/goproxy/internal/cache"
	stdlog "log"
	"net/http"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  logging.Config
	Dev  struct {
		Handlers bool `split_words:"true" default:"true"`
	}
	Flag flag.Options
}

func main() {
	var e environment
	if err := envconfig.Process("prism", &e); err != nil {
		log.WithError(err).Fatal("failed to read environment")
		return
	}
	logging.Init(&e.Log)
	flag.Init(e.Flag)

	// configure routing
	logger := log.New()

	router := mux.NewRouter()
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	router.PathPrefix("/").Handler(&goproxy.Goproxy{
		Cacher:        &cache.Cacher{DirCacher: goproxy.DirCacher("/tmp/")},
		ProxiedSUMDBs: nil,
		Transport:     nil,
		ErrorLogger:   stdlog.New(logger.WriterLevel(log.ErrorLevel), "", 0),
	})
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(e.Dev.Handlers).
		Run()
}
