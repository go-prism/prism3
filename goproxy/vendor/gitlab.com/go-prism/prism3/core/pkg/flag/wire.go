package flag

import (
	"github.com/Unleash/unleash-client-go/v3"
	log "github.com/sirupsen/logrus"
)

type Options struct {
	Token string `split_words:"true"`
	Name  string `split_words:"true" default:"prism3-core"`
	URL   string `split_words:"true"`
	Env   string `split_words:"true"`
}

func Init(opt Options) {
	if opt.Token == "" || opt.Name == "" || opt.URL == "" {
		log.Debug("skipping feature flag setup")
		return
	}
	log.WithFields(log.Fields{
		"name": opt.Name,
		"env":  opt.Env,
		"url":  opt.URL,
	}).Debug("enabling feature flags")
	opts := []unleash.ConfigOption{
		unleash.WithAppName(opt.Name),
		unleash.WithUrl(opt.URL),
		unleash.WithEnvironment(opt.Env),
		unleash.WithInstanceId(opt.Token),
	}
	if err := Initialize(opts...); err != nil {
		log.WithError(err).Error("failed to initialise feature flag provider")
		return
	}
}
