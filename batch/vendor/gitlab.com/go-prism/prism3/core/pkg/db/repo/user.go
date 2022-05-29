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
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{
		db: db,
	}
}

// CreateCtx creates a model.StoredUser based on the user
// inside the current context.Context
func (r *UserRepo) CreateCtx(ctx context.Context) (*model.StoredUser, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_user_createCtx")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("creating or fetching user")
	user, _ := client.GetContextUser(ctx)
	u := &model.StoredUser{
		ID:     user.AsUsername(),
		Sub:    user.Sub,
		Iss:    user.Iss,
		Claims: user.Claims,
	}
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(u).Error; err != nil {
		log.Error(err, "failed to store user profile")
		sentry.CaptureException(err)
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) List(ctx context.Context) ([]*model.StoredUser, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_user_list")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing users")
	var results []*model.StoredUser
	if err := r.db.WithContext(ctx).Find(&results).Error; err != nil {
		log.Error(err, "failed to list users")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}

func (r *UserRepo) SetPreference(ctx context.Context, key, value string) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_user_setPreference", trace.WithAttributes(
		attribute.String("key", key),
		attribute.String("value", value),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Key", key)
	log.V(1).Info("updating preference")
	user, ok := client.GetContextUser(ctx)
	if !ok {
		return errs.ErrUnauthorised
	}
	log.V(2).Info("updating preference", "Value", value)
	if err := r.db.WithContext(ctx).Model(&model.StoredUser{}).Where("id = ?", user.AsUsername()).Update("preferences", gorm.Expr("preferences::jsonb || ?", fmt.Sprintf(`{"%s": "%s"}`, key, value))).Error; err != nil {
		log.Error(err, "failed to update preferences")
		sentry.CaptureException(err)
		return err
	}
	log.V(1).Info("successfully updated preference")
	return nil
}

func (r *UserRepo) Count(ctx context.Context) (int64, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_user_count")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("counting users")
	var result int64
	if err := r.db.WithContext(ctx).Model(&model.StoredUser{}).Count(&result).Error; err != nil {
		log.Error(err, "failed to count users")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}
