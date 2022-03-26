package repo

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/schemas"
	"gorm.io/gorm"
)

func NewPyRepo(db *gorm.DB) *PyPackageRepo {
	return &PyPackageRepo{
		db: db,
	}
}

type GetPackageFunc = func(ctx context.Context, file string) (string, error)

func (r *PyPackageRepo) BatchInsert(ctx context.Context, packages []*schemas.PyPackage) error {
	log.WithContext(ctx).Debugf("upserting %d packages", len(packages))
	if err := r.db.Save(packages).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to upsert packages")
		return err
	}
	return nil
}

func (r *PyPackageRepo) GetPackages(ctx context.Context, pkg string) ([]*schemas.PyPackage, error) {
	log.WithContext(ctx).WithFields(log.Fields{"package": pkg}).Debug("fetching package")
	var results []*schemas.PyPackage
	if err := r.db.Where("name = ?", pkg).Find(&results).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to find packages")
		return nil, err
	}
	return results, nil
}

func (r *PyPackageRepo) GetPackage(ctx context.Context, file string) (string, error) {
	log.WithContext(ctx).WithFields(log.Fields{"package": file}).Debug("fetching package")
	var result string
	if err := r.db.Model(&schemas.PyPackage{}).Where("filename = ?", file).Select("url").First(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to find package")
		return "", err
	}
	return result, nil
}

func (r *PyPackageRepo) Count(ctx context.Context) (int64, error) {
	var result int64
	if err := r.db.Model(&schemas.PyPackage{}).Count(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to count PyPi packages")
		return 0, err
	}
	return result, nil
}
