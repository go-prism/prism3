package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gorm.io/gorm"
	"strings"
	"time"
)

func NewRemoteRepo(db *gorm.DB) *RemoteRepo {
	return &RemoteRepo{
		db: db,
	}
}

func (r *RemoteRepo) CreateRemote(ctx context.Context, in *model.NewRemote) (*model.Remote, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("creating remote")
	var transport model.TransportSecurity
	if in.Transport == "" {
		log.V(1).Info("using default transport")
		// use the default transport
		r.db.WithContext(ctx).Where("id = ?", db.TransportProfileDefault).First(&transport)
	} else if err := r.db.WithContext(ctx).Where("id = ?", in.Transport).First(&transport).Error; err != nil {
		log.Error(err, "failed to find transport")
		sentry.CaptureException(err)
		return nil, err
	}
	log.V(2).Info("selected transport", "Transport", transport)
	result := model.Remote{
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		Name:      in.Name,
		URI:       strings.TrimSuffix(in.URI, "/"),
		Archetype: in.Archetype,
		Enabled:   true,
		Security: &model.RemoteSecurity{
			AuthMode: in.AuthMode,
		},
		Transport: &transport,
	}
	if err := r.db.WithContext(ctx).Create(&result).Error; err != nil {
		log.Error(err, "failed to create remote")
		sentry.CaptureException(err)
		return nil, err
	}
	return &result, nil
}

func (r *RemoteRepo) GetRemote(ctx context.Context, id string) (*model.Remote, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	log.V(1).Info("fetching remote")
	var result model.Remote
	if err := r.db.WithContext(ctx).Preload("Security").Preload("Transport").Where("id = ?", id).First(&result).Error; err != nil {
		log.Error(err, "failed to get remote")
		sentry.CaptureException(err)
		return nil, err
	}
	return &result, nil
}

func (r *RemoteRepo) ListRemotes(ctx context.Context, arch model.Archetype) ([]*model.Remote, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing remotes")
	var result []*model.Remote
	tx := r.db.Preload("Security").Preload("Transport")
	if arch != "" {
		log.V(1).Info("listing remotes by archetype", "Arch", arch)
		tx = tx.Where("archetype = ?", arch)
	}
	if err := tx.WithContext(ctx).Find(&result).Error; err != nil {
		log.Error(err, "failed to list remotes")
		sentry.CaptureException(err)
		return nil, err
	}
	return result, nil
}

func (r *RemoteRepo) Count(ctx context.Context) (int64, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting remotes")
	var result int64
	if err := r.db.WithContext(ctx).Model(&model.Remote{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count remotes")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}
