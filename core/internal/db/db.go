package db

import (
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
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
	)
	if err != nil {
		log.WithError(err).Error("failed to run auto-migration")
		return err
	}
	return nil
}
