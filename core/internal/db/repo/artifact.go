package repo

import (
	"context"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gorm.io/gorm"
	"time"
)

func NewArtifactRepo(db *gorm.DB) *ArtifactRepo {
	return &ArtifactRepo{
		db: db,
	}
}

type CreateArtifactFunc = func(ctx context.Context, path, remote string) error

func (r *ArtifactRepo) CreateArtifact(ctx context.Context, path, remote string) error {
	// try to update the existing artifact
	tx := r.db.Model(&model.Artifact{}).Where("uri = ? AND remote_id = ?", path, remote).Updates(map[string]any{
		"downloads":  gorm.Expr("downloads + ?", 1),
		"updated_at": time.Now().Unix(),
	})
	if err := tx.Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to update artifact")
		return err
	}
	// if we changed something, don't bother
	// creating a new entry
	if tx.RowsAffected > 0 {
		log.WithContext(ctx).Debug("successfully incremented artifact entry")
		return nil
	}
	log.WithContext(ctx).Debug("creating artifact entry")
	result := model.Artifact{
		ID:        uuid.NewV4().String(),
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		URI:       path,
		Downloads: 1,
		RemoteID:  remote,
	}
	if err := r.db.Create(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create artifact")
		return err
	}
	return nil
}

func (r *ArtifactRepo) ListArtifacts(ctx context.Context, remotes []string) ([]*model.Artifact, error) {
	var result []*model.Artifact
	if err := r.db.Where("remote_id = ANY(?::text[])", getAnyQuery(remotes)).Order("uri asc").Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list artifacts")
		return nil, err
	}
	return result, nil
}
