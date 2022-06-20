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

package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewPyRepo(db *gorm.DB) *PyPackageRepo {
	return &PyPackageRepo{
		db: db,
	}
}

type GetPackageFunc = func(ctx context.Context, file string) (string, error)

func (r *PyPackageRepo) BatchInsert(ctx context.Context, packages []*schemas.PyPackage) error {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("upserting packages", "Count", len(packages))
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(packages, 1000).Error; err != nil {
		log.Error(err, "failed to upsert packages")
		sentry.CaptureException(err)
		return returnErr(err, "failed to update PyPi packages")
	}
	return nil
}

func (r *PyPackageRepo) GetPackages(ctx context.Context, pkg string) ([]*schemas.PyPackage, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Package", pkg)
	log.V(1).Info("fetching package")
	var results []*schemas.PyPackage
	if err := r.db.WithContext(ctx).Where("name = ?", pkg).Find(&results).Error; err != nil {
		log.Error(err, "failed to find packages")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to find PyPi packages")
	}
	return results, nil
}

func (r *PyPackageRepo) GetPackage(ctx context.Context, file string) (string, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Package", file)
	log.V(1).Info("fetching package")
	var result string
	if err := r.db.WithContext(ctx).Model(&schemas.PyPackage{}).Where("filename = ?", file).Select("url").First(&result).Error; err != nil {
		log.Error(err, "failed to find package")
		sentry.CaptureException(err)
		return "", returnErr(err, "failed to find PyPi package")
	}
	return result, nil
}

func (r *PyPackageRepo) Count(ctx context.Context) (int64, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting PyPi packages")
	var result int64
	if err := r.db.WithContext(ctx).Model(&schemas.PyPackage{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count PyPi packages")
		sentry.CaptureException(err)
		return 0, returnErr(err, "failed to count PyPi packages")
	}
	return result, nil
}
