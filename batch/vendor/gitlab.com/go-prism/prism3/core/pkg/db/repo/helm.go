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

func NewHelmRepo(db *gorm.DB) *HelmPackageRepo {
	return &HelmPackageRepo{
		db: db,
	}
}

func (r *HelmPackageRepo) BatchInsert(ctx context.Context, packages []*schemas.HelmPackage) error {
	log := logr.FromContextOrDiscard(ctx).WithName("repo_helm")
	log.V(1).Info("upserting packages", "Count", len(packages))
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{DoNothing: true}).CreateInBatches(packages, 1000).Error; err != nil {
		log.Error(err, "failed to upsert packages")
		sentry.CaptureException(err)
		return returnErr(err, "failed to update Helm packages")
	}
	return nil
}

func (r *HelmPackageRepo) GetPackage(ctx context.Context, file string) (string, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("repo_helm").WithValues("File", file)
	log.V(1).Info("fetching package")
	var result string
	if err := r.db.WithContext(ctx).Model(&schemas.HelmPackage{}).Where("filename = ?", file).Select("url").First(&result).Error; err != nil {
		log.Error(err, "failed to find package")
		sentry.CaptureException(err)
		return "", returnErr(err, "failed to find Helm package")
	}
	return result, nil
}

func (r *HelmPackageRepo) GetPackagesInRemotes(ctx context.Context, remotes []string) ([]*schemas.HelmPackage, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("repo_helm")
	log.V(1).Info("fetching packages in remotes", "Remotes", remotes)
	var result []*schemas.HelmPackage
	if err := r.db.WithContext(ctx).Where("remote_id = ANY(?::text[])", getAnyQuery(remotes)).Find(&result).Error; err != nil {
		log.Error(err, "failed to list helm packages")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to list Helm packages")
	}
	return result, nil
}

func (r *HelmPackageRepo) Count(ctx context.Context) (int64, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("repo_helm")
	log.V(1).Info("counting packages")
	var result int64
	if err := r.db.WithContext(ctx).Model(&schemas.HelmPackage{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count Helm packages")
		sentry.CaptureException(err)
		return 0, returnErr(err, "failed to count Helm packages")
	}
	return result, nil
}
