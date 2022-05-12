package errtack

import (
	"context"
	"fmt"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	"os"
	"runtime"
)

type Options struct {
	DSN         string `split_words:"true"`
	Environment string `split_words:"true" envconfig:"GITLAB_ENVIRONMENT_NAME"`
	Release     string `split_words:"true"`
}

func Init(ctx context.Context, opts Options) error {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("initialising sentry")
	log.V(2).Info("using sentry configuration", "Options", opts)
	// get the hostname so we can report
	// who we are
	host, err := os.Hostname()
	if err != nil {
		log.Error(err, "failed to retrieve system hostname")
		host = "unknown"
	}
	log.V(1).Info("resolved hostname", "Hostname", host)
	err = sentry.Init(sentry.ClientOptions{
		Dsn:         opts.DSN,
		ServerName:  host,
		Dist:        fmt.Sprintf("%s-%s", runtime.GOOS, runtime.GOARCH),
		Release:     opts.Release,
		Environment: opts.Environment,
	})
	if err != nil {
		log.Error(err, "failed to initialise sentry")
		return err
	}
	log.V(1).Info("successfully initialised sentry")
	return nil
}
