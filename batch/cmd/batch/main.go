package main

import (
	"context"
	"github.com/gorilla/mux"
	"github.com/hibiken/asynq"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gitlab.com/autokubeops/serverless"
	"gitlab.com/av1o/cap10-ingress/pkg/logging"
	"gitlab.com/go-prism/prism3/batch/internal/task"
	"gitlab.com/go-prism/prism3/batch/internal/task/helmidx"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"net/http"
	"time"
)

type environment struct {
	Port int `envconfig:"PORT" default:"8080"`
	Log  logging.Config

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
	if err := envconfig.Process("prism", &e); err != nil {
		log.WithError(err).Fatal("failed to read environment")
		return
	}
	logging.Init(&e.Log)

	// setup otel
	if err := tracing.Init(&e.Otel); err != nil {
		log.WithError(err).Fatal("failed to setup tracing")
		return
	}

	// configure database
	database, err := db.NewDatabase(e.DB.DSN, e.DB.DSNReplica)
	if err != nil {
		log.WithError(err).Fatal("failed to setup database layer")
		return
	}
	repos := repo.NewRepos(database.DB())
	s3, err := storage.NewS3(context.Background(), e.S3)
	if err != nil {
		log.WithError(err).Fatal("failed to connect to object storage")
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
		PeriodicTaskConfigProvider: task.NewStaticConfigProvider(rp),
		RedisConnOpt:               redisOpt,
		SyncInterval:               time.Minute,
	})
	if err != nil {
		log.WithError(err).Fatal("failed to start cron scheduler")
		return
	}

	go func() {
		if err := srv.Run(handler); err != nil {
			log.WithError(err).Fatal("failed to run asynq server")
		}
	}()

	go func() {
		if err := mgr.Run(); err != nil {
			log.WithError(err).Fatal("failed to run asynq scheduler")
		}
	}()

	// configure routing
	router := mux.NewRouter()
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithHandlers(e.Dev.Handlers).
		Run()
}
