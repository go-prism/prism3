/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package db

import (
	"context"
	"github.com/Unleash/unleash-client-go/v3"
	"github.com/djcass44/go-utils/flagging"
	"github.com/djcass44/go-utils/orm"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	otelgorm "github.com/kostyay/gorm-opentelemetry"
	"gitlab.com/go-prism/prism3/core/internal/features"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/plugin/dbresolver"
	"time"
)
import "gorm.io/driver/postgres"

func NewDatabase(ctx context.Context, dsn string, replicas ...string) (*Database, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("database")
	// configure primary
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: flagging.IsEnabled(features.DBSkipDefaultTransaction, unleash.WithFallback(true)),
		Logger:                 orm.NewGormLogger(log, time.Millisecond*200),
	})
	if err != nil {
		log.Error(err, "failed to open database connection")
		sentry.CaptureException(err)
		return nil, err
	}
	log.V(1).Info("database options", "SkipDefaultTransaction", database.SkipDefaultTransaction)
	// configure read-replicas
	var r []gorm.Dialector
	for i := range replicas {
		if replicas[i] == "" {
			log.V(2).Info("skipping empty replica DSN")
			continue
		}
		log.V(2).Info("creating new replica", "DSN", replicas[i])
		r = append(r, postgres.Open(replicas[i]))
	}
	log.V(1).Info("enabling plugins")
	if err := database.Use(otelgorm.NewPlugin()); err != nil {
		sentry.CaptureException(err)
		log.Error(err, "failed to enable SQL OpenTracing plugin")
	}
	if err := database.Use(dbresolver.Register(dbresolver.Config{
		Replicas: r,
		Policy:   dbresolver.RandomPolicy{},
	})); err != nil {
		sentry.CaptureException(err)
		log.Error(err, "failed to establish database replica connections")
	}
	log.Info("established database connection")
	return &Database{
		db:  database,
		dsn: dsn,
		log: log,
	}, nil
}

func (db *Database) DB() *gorm.DB {
	return db.db
}

func (db *Database) Init() error {
	log := db.log
	log.Info("running database migrations")
	err := db.db.AutoMigrate(
		&model.Remote{},
		&model.Refraction{},
		&model.RemoteSecurity{},
		&model.TransportSecurity{},
		&model.Artifact{},
		&model.StoredUser{},
		&schemas.NPMPackage{},
		&schemas.PyPackage{},
		&schemas.HelmPackage{},
	)
	if err != nil {
		log.Error(err, "failed to run auto-migration")
		sentry.CaptureException(err)
		return err
	}
	if err := db.defaults(); err != nil {
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (db *Database) defaults() error {
	log := db.log
	// create the default transport profile
	log.V(1).Info("creating default transport profile", "ID", TransportProfileDefault, "Name", "default")
	if err := db.db.Save(&model.TransportSecurity{ID: TransportProfileDefault, Name: "default"}).Error; err != nil {
		log.Error(err, "failed to create default transport profile")
		return err
	}
	// create Go remote
	log.V(1).Info("creating default Go remote", "ID", GoRemote, "Name", "go")
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
		log.Error(err, "failed to create default Go remote")
		return err
	}
	// create Go refraction
	log.V(1).Info("creating default Go refraction", "ID", GoRefraction, "Name", "go")
	err := db.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.Refraction{
		ID:        GoRefraction,
		Name:      "go",
		Archetype: model.ArchetypeGo,
		Remotes:   []*model.Remote{defaultGoRemote},
	}).Error
	if err != nil {
		log.Error(err, "failed to create default Go remote")
		return err
	}
	log.V(1).Info("successfully generated default data")
	return nil
}
