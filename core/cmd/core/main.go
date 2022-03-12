package main

import (
	"github.com/gorilla/mux"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gitlab.com/autokubeops/serverless"
	"net/http"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
}

func main() {
	var e environment
	if err := envconfig.Process("prism", &e); err != nil {
		log.WithError(err).Fatal("failed to read environment")
		return
	}

	// configure routing
	router := mux.NewRouter()
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})

	// start serving
	serverless.NewBuilder(router).
		WithPort(e.Port).
		Run()
}
