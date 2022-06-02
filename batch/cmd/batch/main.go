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

package main

import (
	"context"
	"github.com/djcass44/go-utils/logging"
	"github.com/djcass44/go-utils/otel"
	"github.com/gorilla/mux"
	"github.com/hibiken/asynq"
	"github.com/kelseyhightower/envconfig"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/go-prism/prism3/batch/internal/task"
	"gitlab.com/go-prism/prism3/batch/internal/task/helmidx"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"net/http"
	"os"
	"time"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  struct {
		Level int `split_words:"true"`
	}
	DB struct {
		DSN        string `split_words:"true" required:"true"`
		DSNReplica string `split_words:"true"`
	}
	S3  storage.S3Options
	Dev struct {
		Handlers bool `split_words:"true" default:"true"`
	}
	Redis struct {
		Addr     string `split_words:"true" required:"true"`
		Password string `split_words:"true"`
	}
	Otel tracing.OtelOptions
}

func main() {
	var e environment
	envconfig.MustProcess("prism", &e)
	// configure logging
	zc := zap.NewProductionConfig()
	zc.Level = zap.NewAtomicLevelAt(zapcore.Level(e.Log.Level * -1))
	log, ctx := logging.NewZap(context.TODO(), zc)

	// setup otel
	err := otel.Build(ctx, otel.Options{
		Enabled:       e.Otel.Enabled,
		ServiceName:   tracing.ServiceNameCore,
		Environment:   e.Otel.Environment,
		KubeNamespace: os.Getenv("KUBE_NAMESPACE"),
		SampleRate:    e.Otel.SampleRate,
	})
	if err != nil {
		log.Error(err, "failed to setup tracing")
		os.Exit(1)
		return
	}

	// configure database
	database, err := db.NewDatabase(ctx, e.DB.DSN, e.DB.DSNReplica)
	if err != nil {
		log.Error(err, "failed to setup database layer")
		os.Exit(1)
		return
	}
	repos := repo.NewRepos(database.DB())
	s3, err := storage.NewS3(context.Background(), e.S3)
	if err != nil {
		log.Error(err, "failed to connect to object storage")
		os.Exit(1)
		return
	}

	// configure asynq serving
	redisOpt := asynq.RedisClientOpt{
		Addr:     e.Redis.Addr,
		Password: e.Redis.Password,
	}
	srv := asynq.NewServer(redisOpt, asynq.Config{})
	client := asynq.NewClient(redisOpt)

	// configure tasks
	helm := helmidx.NewHelmProcessor(repos, s3)
	rp := task.NewRemoteProcessor(client, repos, helm)

	handler := asynq.NewServeMux()
	handler.Handle(tasks.TypeHelmRepository, helm)
	handler.HandleFunc(tasks.TypeIndexRemote, rp.HandleIndexTask)
	handler.HandleFunc(tasks.TypeIndexRemoteAll, rp.HandleIndexAllTask)

	mgr, err := asynq.NewPeriodicTaskManager(asynq.PeriodicTaskManagerOpts{
		PeriodicTaskConfigProvider: task.NewStaticConfigProvider(ctx, rp),
		RedisConnOpt:               redisOpt,
		SyncInterval:               time.Minute,
	})
	if err != nil {
		log.Error(err, "failed to start cron scheduler")
		os.Exit(1)
		return
	}

	go func() {
		if err := srv.Run(handler); err != nil {
			log.Error(err, "failed to run asynq server")
			os.Exit(1)
		}
	}()

	go func() {
		if err := mgr.Run(); err != nil {
			log.Error(err, "failed to run asynq scheduler")
			os.Exit(1)
		}
	}()

	// configure routing
	router := mux.NewRouter()
	router.Use(logging.Middleware(log))
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(e.Dev.Handlers).
		WithLogger(log).
		Run()
}
