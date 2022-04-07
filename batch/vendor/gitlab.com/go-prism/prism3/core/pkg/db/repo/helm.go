package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewHelmRepo(db *gorm.DB) *HelmPackageRepo {
	return &HelmPackageRepo{
		db: db,
	}
}

func (r *HelmPackageRepo) BatchInsert(ctx context.Context, packages []*schemas.HelmPackage) error {
	log.WithContext(ctx).Debugf("upserting %d packages", len(packages))
	if err := r.db.Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(packages, 1000).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to upsert packages")
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (r *HelmPackageRepo) GetPackage(ctx context.Context, file string) (string, error) {
	log.WithContext(ctx).WithFields(log.Fields{"package": file}).Debug("fetching package")
	var result string
	if err := r.db.Model(&schemas.HelmPackage{}).Where("filename = ?", file).Select("url").First(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to find package")
		sentry.CaptureException(err)
		return "", returnErr(err, "failed to find package")
	}
	return result, nil
}

func (r *HelmPackageRepo) GetPackagesInRemotes(ctx context.Context, remotes []string) ([]*schemas.HelmPackage, error) {
	var result []*schemas.HelmPackage
	if err := r.db.Where("remote_id = ANY(?::text[])", getAnyQuery(remotes)).Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list helm packages")
		sentry.CaptureException(err)
		return nil, err
	}
	return result, nil
}

func (r *HelmPackageRepo) Count(ctx context.Context) (int64, error) {
	var result int64
	if err := r.db.Model(&schemas.HelmPackage{}).Count(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to count Helm packages")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}
