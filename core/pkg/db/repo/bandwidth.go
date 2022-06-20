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
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"path/filepath"
	"time"
)

func NewBandwidthRepo(db *gorm.DB) *BandwidthRepo {
	return &BandwidthRepo{
		db: db,
	}
}

func (r *BandwidthRepo) Create(ctx context.Context, resource string, usage int64, bandwidthType model.BandwidthType) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_bandwidth_create")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("updating bandwidth usage")
	date := time.Now().Format("200601")
	b := &model.BandwidthUsage{
		ID:       filepath.Join(date, resource, string(bandwidthType)),
		Date:     date,
		Resource: resource,
		Usage:    usage,
		Type:     bandwidthType,
	}
	// create the resource
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{"usage": gorm.Expr("bandwidth_usages.usage + ?", usage)}),
	}).Create(b).Error; err != nil {
		log.Error(err, "failed to update bandwidth usage")
		return returnErr(err, "failed to update bandwidth usage")
	}
	return nil
}

func (r *BandwidthRepo) Get(ctx context.Context, resource, date string) ([]*model.BandwidthUsage, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_bandwidth_get")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("fetching bandwidth usage")
	var results []*model.BandwidthUsage
	if err := r.db.WithContext(ctx).Where("resource = ? AND date = ?", resource, date).Find(&results).Error; err != nil {
		log.Error(err, "failed to fetch bandwidth usage")
		return nil, returnErr(err, "failed to fetch bandwidth usage")
	}
	return results, nil
}
