package main

import (
	"context"
	"github.com/djcass44/go-utils/flagging"
	"github.com/djcass44/go-utils/logging"
	"github.com/djcass44/go-utils/otel"
	"github.com/goproxy/goproxy"
	"github.com/gorilla/mux"
	"github.com/kelseyhightower/envconfig"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"gitlab.com/go-prism/prism3/goproxy/internal/cache"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	stdlog "log"
	"net/http"
	"os"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  struct {
		Level int `split_words:"true"`
	}

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

	s3, err := storage.NewS3(ctx, e.S3)
	if err != nil {
		log.Error(err, "failed to connect to object storage")
		os.Exit(1)
		return
	}

	// setup otel
	err = otel.Build(context.TODO(), otel.Options{
		Enabled:       e.Otel.Enabled,
		ServiceName:   tracing.ServiceNameGoProxy,
		Environment:   e.Otel.Environment,
		KubeNamespace: os.Getenv("KUBE_NAMESPACE"),
		SampleRate:    e.Otel.SampleRate,
	})
	if err != nil {
		log.Error(err, "failed to setup tracing")
		os.Exit(1)
		return
	}

	// configure routing
	router := mux.NewRouter()
	router.Use(otelmux.Middleware(tracing.ServiceNameGoProxy))
	router.Use(logging.NewMiddleware(log).ServeHTTP)
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	router.PathPrefix("/").Handler(&goproxy.Goproxy{
		Cacher:        cache.NewCacher(s3),
		ProxiedSUMDBs: nil,
		Transport:     otelhttp.NewTransport(http.DefaultTransport),
		//ErrorLogger:   stdlog.New(log, "", 0),
	})
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(e.Dev.Handlers).
		WithLogger(log).
		Run()
}
