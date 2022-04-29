package db

import (
	"github.com/Unleash/unleash-client-go/v3"
	"github.com/getsentry/sentry-go"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/features"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/flag"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/plugin/dbresolver"
	gormopentracing "gorm.io/plugin/opentracing"
)
import "gorm.io/driver/postgres"

func NewDatabase(dsn string, replicas ...string) (*Database, error) {
	// configure primary
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: flag.IsEnabled(features.DBSkipDefaultTransaction, unleash.WithFallback(true)),
	})
	if err != nil {
		log.WithError(err).Error("failed to open database connection")
		sentry.CaptureException(err)
		return nil, err
	}
	log.Debugf("default transactions: %v", database.SkipDefaultTransaction)
	// configure read-replicas
	var r []gorm.Dialector
	for i := range replicas {
		if replicas[i] == "" {
			continue
		}
		r = append(r, postgres.Open(replicas[i]))
	}
	if err := database.Use(gormopentracing.New()); err != nil {
		sentry.CaptureException(err)
		log.WithError(err).Error("failed to enable SQL OpenTracing plugin")
	}
	if err := database.Use(dbresolver.Register(dbresolver.Config{
		Replicas: r,
		Policy:   dbresolver.RandomPolicy{},
	})); err != nil {
		sentry.CaptureException(err)
		log.WithError(err).Error("failed to establish database replica connections")
	}
	log.Info("established database connection")
	return &Database{
		db:  database,
		dsn: dsn,
	}, nil
}

func (db *Database) DB() *gorm.DB {
	return db.db
}

func (db *Database) Init(superuser string) error {
	log.Info("running database migrations")
	err := db.db.AutoMigrate(
		&model.Remote{},
		&model.Refraction{},
		&model.RemoteSecurity{},
		&model.TransportSecurity{},
		&model.Artifact{},
		&model.RoleBinding{},
		&model.StoredUser{},
		&schemas.NPMPackage{},
		&schemas.PyPackage{},
		&schemas.HelmPackage{},
	)
	if err != nil {
		log.WithError(err).Error("failed to run auto-migration")
		sentry.CaptureException(err)
		return err
	}
	if err := db.defaults(superuser); err != nil {
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (db *Database) defaults(superuser string) error {
	// create the default transport profile
	if err := db.db.Save(&model.TransportSecurity{ID: TransportProfileDefault, Name: "default"}).Error; err != nil {
		log.WithError(err).Error("failed to create default transport profile")
		return err
	}
	// create the default role-binding
	if superuser == "" {
		log.Warning("Initial superuser has not been set")
	}
	err := db.db.Save(&model.RoleBinding{
		ID:      SuperUserDefault,
		Subject: superuser,
		Role:    model.RoleSuper,
	}).Error
	if err != nil {
		log.WithError(err).Error("failed to create default superuser rolebinding")
		return err
	}
	// create Go remote
	defaultGoRemote := &model.Remote{
		ID:          GoRemote,
		Name:        "go",
		URI:         "",
		Archetype:   model.ArchetypeGo,
		Enabled:     true,
		Security:    &model.RemoteSecurity{},
		TransportID: TransportProfileDefault,
	}
	if err := db.db.Clauses(clause.OnConflict{DoNothing: true}).Create(defaultGoRemote).Error; err != nil {
		log.WithError(err).Error("failed to create default Go remote")
		return err
	}
	// create Go refraction
	err = db.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.Refraction{
		ID:        GoRefraction,
		Name:      "go",
		Archetype: model.ArchetypeGo,
		Remotes:   []*model.Remote{defaultGoRemote},
	}).Error
	if err != nil {
		log.WithError(err).Error("failed to create default Go remote")
		return err
	}
	return nil
}
