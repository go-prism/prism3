package repo

import (
	"context"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/db"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gorm.io/gorm"
	"time"
)

func NewRemoteRepo(db *gorm.DB) *RemoteRepo {
	return &RemoteRepo{
		db: db,
	}
}

func (r *RemoteRepo) CreateRemote(ctx context.Context, in *model.NewRemote) (*model.Remote, error) {
	var transport model.TransportSecurity
	if in.Transport == "" {
		// use the default transport
		r.db.Where("id = ?", db.TransportProfileDefault).First(&transport)
	} else if err := r.db.Where("id = ?", in.Transport).First(&transport).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to find transport")
		return nil, err
	}
	result := model.Remote{
		ID:        uuid.NewV4().String(),
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		Name:      in.Name,
		URI:       in.URI,
		Archetype: in.Archetype,
		Enabled:   true,
		Security: &model.RemoteSecurity{
			ID:          uuid.NewV4().String(),
			Allowed:     nil,
			Blocked:     nil,
			AuthHeaders: nil,
		},
		Transport: &transport,
	}
	if err := r.db.Create(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create remote")
		return nil, err
	}
	return &result, nil
}

func (r *RemoteRepo) GetRemote(ctx context.Context, id string) (*model.Remote, error) {
	var result model.Remote
	if err := r.db.Preload("Security").Preload("Transport").Where("id = ?", id).First(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get remote")
		return nil, err
	}
	return &result, nil
}

func (r *RemoteRepo) ListRemotes(ctx context.Context, arch model.Archetype) ([]*model.Remote, error) {
	var result []*model.Remote
	tx := r.db.Preload("Security").Preload("Transport")
	if arch != "" {
		tx = tx.Where("archetype = ?", arch)
	}
	if err := tx.Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list remotes")
		return nil, err
	}
	return result, nil
}
