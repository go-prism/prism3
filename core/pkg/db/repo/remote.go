/*
 *    Copyright 2023 Django Cass
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
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
	"strings"
	"time"
)

func NewRemoteRepo(db *gorm.DB) *RemoteRepo {
	return &RemoteRepo{
		db: db,
	}
}

func (r *RemoteRepo) DeleteRemote(ctx context.Context, id string) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_remote_deleteRemote", trace.WithAttributes(
		attribute.String("id", id),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	log.Info("deleting remote")

	// fetch the original remote
	rem, err := r.GetRemote(ctx, id, true)
	if err != nil {
		log.Error(err, "failed to fetch original remote")
		sentry.CaptureException(err)
		return returnErr(err, "failed to fetch original remote")
	}

	// block changes to Go archetypes
	// since they must be managed by Prism
	if rem.Archetype == model.ArchetypeGo {
		log.Error(errs.ErrForbidden, "rejecting request to modify Go remote")
		return returnErr(errs.ErrForbidden, "rejecting request to modify Go remote")
	}

	// delete references to the remote from refractions
	if err := r.db.WithContext(ctx).Model(&[]model.Refraction{}).Association("Remotes").Delete(rem); err != nil {
		log.Error(err, "failed to delete associated remotes")
		sentry.CaptureException(err)
		return returnErr(err, "failed to delete associated remotes")
	}

	// delete the remote
	if err := r.db.WithContext(ctx).Delete(rem).Error; err != nil {
		log.Error(err, "failed to delete remote")
		sentry.CaptureException(err)
		return returnErr(err, "failed to delete remote")
	}
	log.Info("successfully deleted remote")
	return nil
}

func (r *RemoteRepo) PatchRemote(ctx context.Context, id string, in *model.PatchRemote) (*model.Remote, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_remote_patchRemote", trace.WithAttributes(
		attribute.String("id", id),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	log.V(1).Info("patching remote")
	// fetch the original remote
	var rem model.Remote
	if err := r.db.WithContext(ctx).Preload("Security").Where("id = ?", id).First(&rem).Error; err != nil {
		log.Error(err, "failed to fetch remote")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to fetch remote")
	}
	// block changes to Go archetypes
	// since they must be managed by Prism
	if rem.Archetype == model.ArchetypeGo {
		log.Error(errs.ErrForbidden, "rejecting request to modify Go remote")
		return nil, returnErr(errs.ErrForbidden, "rejecting request to modify Go remote")
	}
	// update the remote
	rem.Security.Allowed = in.Allowed
	rem.Security.Blocked = in.Blocked
	rem.Security.AuthMode = in.AuthMode
	rem.Security.DirectHeader = in.DirectHeader
	rem.Security.DirectToken = in.DirectToken
	rem.Security.AuthHeaders = in.AuthHeaders

	// save the changes
	if err := r.db.WithContext(ctx).Save(&rem.Security).Error; err != nil {
		log.Error(err, "failed to update remote security profile")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to update remote security profile")
	}
	return &rem, nil
}

func (r *RemoteRepo) CreateRemote(ctx context.Context, in *model.NewRemote) (*model.Remote, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_remote_createRemote")
	defer span.End()
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
		return nil, returnErr(err, "failed to find transport")
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
		return nil, returnErr(err, "failed to create remote")
	}
	return &result, nil
}

func (r *RemoteRepo) GetRemote(ctx context.Context, id string, sensitive bool) (*model.Remote, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_remote_getRemote", trace.WithAttributes(
		attribute.String("id", id),
		attribute.Bool("sensitive", sensitive),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	log.V(1).Info("fetching remote")
	var result model.Remote
	tx := r.db.WithContext(ctx).Preload("Security").Preload("Transport")
	if !sensitive {
		log.V(1).Info("omitting Security.DirectToken")
		tx = tx.Omit("Security.DirectToken")
	}
	if err := tx.Where("id = ?", id).First(&result).Error; err != nil {
		log.Error(err, "failed to get remote")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to get remote")
	}
	return &result, nil
}

func (r *RemoteRepo) ListRemotes(ctx context.Context, arch model.Archetype, sensitive bool) ([]*model.Remote, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_remote_listRemotes", trace.WithAttributes(
		attribute.String("archetype", string(arch)),
		attribute.Bool("sensitive", sensitive),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing remotes")
	var result []*model.Remote
	tx := r.db.Preload("Security").Preload("Transport")
	if arch != "" {
		log.V(1).Info("listing remotes by archetype", "Arch", arch)
		tx = tx.Where("archetype = ?", arch)
	}
	if !sensitive {
		log.V(1).Info("omitting Security.DirectToken")
		tx = tx.Omit("Security.DirectToken")
	}
	if err := tx.WithContext(ctx).Find(&result).Error; err != nil {
		log.Error(err, "failed to list remotes")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to list remotes")
	}
	return result, nil
}

func (r *RemoteRepo) Count(ctx context.Context) (int64, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_remote_count")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting remotes")
	var result int64
	if err := r.db.WithContext(ctx).Model(&model.Remote{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count remotes")
		sentry.CaptureException(err)
		return 0, returnErr(err, "failed to count remotes")
	}
	return result, nil
}
