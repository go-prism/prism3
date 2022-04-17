package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
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
		sentry.CaptureException(err)
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
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		URI:       path,
		Downloads: 1,
		RemoteID:  remote,
	}
	if err := r.db.Create(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create artifact")
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (r *ArtifactRepo) ListArtifacts(ctx context.Context, remotes []string) ([]*model.Artifact, error) {
	var result []*model.Artifact
	if err := r.db.Where("remote_id = ANY(?::text[])", getAnyQuery(remotes)).Order("uri asc").Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list artifacts")
		sentry.CaptureException(err)
		return nil, err
	}
	return result, nil
}

func (r *ArtifactRepo) Count(ctx context.Context) (int64, error) {
	var result int64
	if err := r.db.Model(&model.Artifact{}).Count(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to count artifacts")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}

func (r *ArtifactRepo) CountArtifactsByRemote(ctx context.Context, remote string) (int64, error) {
	var result int64
	if err := r.db.Model(&model.Artifact{}).Where("remoteID = ?", remote).Count(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to count artifacts")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}

func (r *ArtifactRepo) Downloads(ctx context.Context) (int64, error) {
	var result int64
	if err := r.db.Model(&model.Artifact{}).Select("COALESCE(SUM(downloads), 0)").Scan(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to aggregate downloads")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}