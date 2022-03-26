package db

import (
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/schemas"
	"gorm.io/gorm"
)
import "gorm.io/driver/postgres"

func NewDatabase(dsn string) (*Database, error) {
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.WithError(err).Error("failed to open database connection")
		return nil, err
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

func (db *Database) Init() error {
	log.Info("running database migrations")
	err := db.db.AutoMigrate(
		&model.Remote{},
		&model.Refraction{},
		&model.RemoteSecurity{},
		&model.TransportSecurity{},
		&model.Artifact{},
		&schemas.NPMPackage{},
		&schemas.PyPackage{},
		&schemas.HelmPackage{},
	)
	if err != nil {
		log.WithError(err).Error("failed to run auto-migration")
		return err
	}
	if err := db.defaults(); err != nil {
		return err
	}
	return nil
}

func (db *Database) defaults() error {
	// create the default transport profile
	if err := db.db.Save(&model.TransportSecurity{ID: TransportProfileDefault, Name: "default"}).Error; err != nil {
		log.WithError(err).Error("failed to create default transport profile")
		return err
	}
	return nil
}
