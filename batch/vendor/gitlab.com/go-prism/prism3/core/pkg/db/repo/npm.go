package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewNPMRepo(db *gorm.DB) *NPMPackageRepo {
	return &NPMPackageRepo{
		db: db,
	}
}

func (r *NPMPackageRepo) Insert(ctx context.Context, pkg, data string) error {
	log := logr.FromContextOrDiscard(ctx).WithValues("Package", pkg)
	log.V(1).Info("upserting package")
	tx := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "name"}},
		// merge the new data in with the existing if there's a conflict
		DoUpdates: clause.Assignments(map[string]interface{}{"document": gorm.Expr("npm_packages.document || excluded.document")}),
	})
	if err := tx.Model(&schemas.NPMPackage{}).Create(&schemas.NPMPackage{Name: pkg, Document: datatypes.JSON(data)}).Error; err != nil {
		log.Error(err, "failed to upsert package")
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (r *NPMPackageRepo) GetPackage(ctx context.Context, pkg string) (string, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Package", pkg)
	log.V(1).Info("fetching package")
	var result string
	if err := r.db.WithContext(ctx).Model(&schemas.NPMPackage{}).Where("name = ?", pkg).Select("document::text").First(&result).Error; err != nil {
		log.Error(err, "failed to find package")
		sentry.CaptureException(err)
		return "", returnErr(err, "failed to find package")
	}
	return result, nil
}

func (r *NPMPackageRepo) GetPackageVersion(ctx context.Context, pkg, version string) (string, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Package", pkg, "Version", version)
	log.V(1).Info("fetching package version")
	var result string
	if err := r.db.WithContext(ctx).Model(&schemas.NPMPackage{}).Where("name = ?", pkg).Select("document->'versions'->>?", version).First(&result).Error; err != nil {
		log.Error(err, "failed to find package")
		sentry.CaptureException(err)
		return "", returnErr(err, "failed to find package")
	}
	return result, nil
}

func (r *NPMPackageRepo) Count(ctx context.Context) (int64, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting NPM packages")
	var result int64
	if err := r.db.WithContext(ctx).Model(&schemas.NPMPackage{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count NPM packages")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}
