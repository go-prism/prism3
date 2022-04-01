package logging

import (
	log "github.com/sirupsen/logrus"
	stdlog "log"
)

type Config struct {
	Debug  bool
	Format struct {
		JSON bool `split_words:"true"`
	}
	ReportCaller bool `split_words:"true"`
}

// Init configures logging according
// to the given Config.
//
// It also hijacks the stdlib logging
// and forces it to use logrus.
func Init(c *Config) {
	if c.Format.JSON {
		log.SetFormatter(&log.JSONFormatter{})
	}
	log.SetReportCaller(c.ReportCaller)
	if c.Debug {
		log.SetLevel(log.DebugLevel)
		log.Debug("enabled debug logging")
	}
	// hijack stdlib logging
	stdlog.SetOutput(log.New().Writer())
}
