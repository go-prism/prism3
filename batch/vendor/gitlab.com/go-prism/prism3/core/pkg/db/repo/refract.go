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
	"fmt"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"gorm.io/gorm"
	"strings"
	"time"
)

func NewRefractRepo(db *gorm.DB) *RefractRepo {
	return &RefractRepo{
		db: db,
	}
}

func getAnyQuery[T string | int | ~uint](vals []T) string {
	items := make([]string, len(vals))
	for i := range vals {
		items[i] = fmt.Sprintf(`"%v"`, vals[i])
	}
	return fmt.Sprintf("{%s}", strings.Join(items, ","))
}

func (r *RefractRepo) PatchRefraction(ctx context.Context, id string, in *model.PatchRefract) (*model.Refraction, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_refract_patchRefraction")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	log.V(1).Info("patching refraction")
	// fetch the original refraction
	var ref model.Refraction
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&ref).Error; err != nil {
		log.Error(err, "failed to fetch refraction")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to fetch refraction")
	}
	// block changes to Go archetypes since
	// they must be managed by Prism
	if ref.Archetype == model.ArchetypeGo {
		log.Error(errs.ErrForbidden, "rejecting request to modify Go refraction")
		return nil, errs.ErrForbidden
	}
	// fetch the remotes
	var remotes []*model.Remote
	if err := r.db.WithContext(ctx).Omit("Security.DirectToken").Where("id = ANY(?::uuid[])", getAnyQuery(in.Remotes)).Find(&remotes).Error; err != nil {
		log.Error(err, "failed to retrieve remotes")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to retrieve remotes")
	}
	// update the refraction
	ref.Name = in.Name
	ref.Remotes = remotes
	ref.UpdatedAt = time.Now().Unix()
	// save the changes
	if err := r.db.WithContext(ctx).Save(&ref).Error; err != nil {
		log.Error(err, "failed to update refraction")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to update refraction")
	}
	return &ref, nil
}

func (r *RefractRepo) CreateRefraction(ctx context.Context, in *model.NewRefract) (*model.Refraction, error) {
	log := logr.FromContextOrDiscard(ctx)
	var remotes []*model.Remote
	if err := r.db.WithContext(ctx).Omit("Security.DirectToken").Where("id = ANY(?::uuid[])", getAnyQuery(in.Remotes)).Find(&remotes).Error; err != nil {
		log.Error(err, "failed to retrieve remotes")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to retrieve remotes")
	}
	result := model.Refraction{
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		Name:      in.Name,
		Archetype: in.Archetype,
		Remotes:   remotes,
	}
	if err := r.db.WithContext(ctx).Create(&result).Error; err != nil {
		log.Error(err, "failed to create refraction")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to create refraction")
	}
	return &result, nil
}

func (r *RefractRepo) GetRefractionByName(ctx context.Context, name string) (*model.Refraction, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Name", name)
	log.V(1).Info("fetching refraction by name")
	var result model.Refraction
	if err := r.db.WithContext(ctx).Preload("Remotes").Preload("Remotes.Security").Omit("Remotes.Security.DirectToken").Preload("Remotes.Transport").Where("name = ?", name).First(&result).Error; err != nil {
		log.Error(err, "failed to get refraction")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to get refraction")
	}
	return &result, nil
}

func (r *RefractRepo) GetRefraction(ctx context.Context, id string) (*model.Refraction, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	log.V(1).Info("fetching refraction")
	var result model.Refraction
	if err := r.db.WithContext(ctx).Preload("Remotes").Omit("Remotes.Security.DirectToken").Where("id = ?", id).First(&result).Error; err != nil {
		log.Error(err, "failed to get refraction")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to get refraction")
	}
	return &result, nil
}

func (r *RefractRepo) ListNames(ctx context.Context) ([]*ResourceName, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing refraction names")
	var results []string
	if err := r.db.WithContext(ctx).Model(&model.Refraction{}).Select("name").Find(&results).Error; err != nil {
		log.Error(err, "failed to fetch refraction names")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to fetch refraction names")
	}
	resources := make([]*ResourceName, len(results))
	for i := range results {
		resources[i] = &ResourceName{
			Name:     results[i],
			Resource: ResourceRefraction,
		}
	}
	return resources, nil
}

func (r *RefractRepo) ListRefractions(ctx context.Context) ([]*model.Refraction, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing refractions")
	var result []*model.Refraction
	if err := r.db.WithContext(ctx).Preload("Remotes").Omit("Remotes.Security.DirectToken").Find(&result).Error; err != nil {
		log.Error(err, "failed to list refractions")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to list refractions")
	}
	return result, nil
}

func (r *RefractRepo) Count(ctx context.Context) (int64, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting refractions")
	var result int64
	if err := r.db.WithContext(ctx).Model(&model.Refraction{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count refractions")
		sentry.CaptureException(err)
		return 0, returnErr(err, "failed to count refractions")
	}
	return result, nil
}
