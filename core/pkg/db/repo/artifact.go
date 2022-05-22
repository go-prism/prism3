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
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
	"strings"
	"time"
)

func NewArtifactRepo(db *gorm.DB) *ArtifactRepo {
	return &ArtifactRepo{
		db: db,
	}
}

type CreateArtifactFunc = func(ctx context.Context, path, remote string) error

func (r *ArtifactRepo) CreateArtifact(ctx context.Context, path, remote string) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_artifact_createArtifact", trace.WithAttributes(
		attribute.String("path", path),
		attribute.String("remote", remote),
	))
	defer span.End()
	// normalise the path
	path = strings.TrimPrefix(path, "/")
	span.SetAttributes(attribute.String("path_normal", path))
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", path, "Remote", remote)
	// try to update the existing artifact
	tx := r.db.WithContext(ctx).Model(&model.Artifact{}).Where("uri = ? AND remote_id = ?", path, remote).Updates(map[string]any{
		"downloads":  gorm.Expr("downloads + ?", 1),
		"updated_at": time.Now().Unix(),
	})
	if err := tx.Error; err != nil {
		log.Error(err, "failed to update artifact")
		sentry.CaptureException(err)
		return err
	}
	// if we changed something, don't bother
	// creating a new entry
	if tx.RowsAffected > 0 {
		log.V(1).Info("successfully incremented artifact entry")
		return nil
	}
	log.V(1).Info("creating artifact entry")
	result := model.Artifact{
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		URI:       path,
		Downloads: 1,
		RemoteID:  remote,
	}
	if err := r.db.WithContext(ctx).Create(&result).Error; err != nil {
		log.Error(err, "failed to create artifact")
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (r *ArtifactRepo) ListArtifacts(ctx context.Context, remotes []string) ([]*model.Artifact, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_artifact_listArtifacts", trace.WithAttributes(
		attribute.StringSlice("remotes", remotes),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing artifacts", "Remotes", remotes)
	var result []*model.Artifact
	if err := r.db.WithContext(ctx).Where("remote_id = ANY(?::text[])", getAnyQuery(remotes)).Order("uri asc").Find(&result).Error; err != nil {
		log.Error(err, "failed to list artifacts")
		sentry.CaptureException(err)
		return nil, err
	}
	return result, nil
}

func (r *ArtifactRepo) Count(ctx context.Context) (int64, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_artifact_count")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting artifacts")
	var result int64
	if err := r.db.Model(&model.Artifact{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count artifacts")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}

func (r *ArtifactRepo) CountArtifactsByRemote(ctx context.Context, remote string) (int64, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_artifact_countArtifactsByRemote", trace.WithAttributes(
		attribute.String("remote", remote),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Remote", remote)
	log.V(1).Info("counting artifacts")
	var result int64
	if err := r.db.WithContext(ctx).Model(&model.Artifact{}).Where("remoteID = ?", remote).Count(&result).Error; err != nil {
		log.Error(err, "failed to count artifacts")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}

func (r *ArtifactRepo) Downloads(ctx context.Context) (int64, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_artifact_downloads")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting artifact downloads")
	var result int64
	if err := r.db.WithContext(ctx).Model(&model.Artifact{}).Select("COALESCE(SUM(downloads), 0)").Scan(&result).Error; err != nil {
		log.Error(err, "failed to aggregate downloads")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}
