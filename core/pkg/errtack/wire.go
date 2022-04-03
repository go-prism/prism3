package errtack

import (
	"fmt"
	"github.com/getsentry/sentry-go"
	log "github.com/sirupsen/logrus"
	"os"
	"runtime"
)

type Options struct {
	DSN         string `split_words:"true"`
	Environment string `split_words:"true" envconfig:"GITLAB_ENVIRONMENT_NAME"`
	Release     string `split_words:"true"`
}

func Init(opts Options) error {
	// get the hostname so we can report
	// who we are
	host, err := os.Hostname()
	if err != nil {
		log.WithError(err).Error("failed to retrieve system hostname")
		host = "unknown"
	}
	err = sentry.Init(sentry.ClientOptions{
		Dsn:         opts.DSN,
		ServerName:  host,
		Dist:        fmt.Sprintf("%s-%s", runtime.GOOS, runtime.GOARCH),
		Release:     opts.Release,
		Environment: opts.Environment,
	})
	if err != nil {
		log.WithError(err).Error("failed to initialise sentry")
		return err
	}
	return nil
}
