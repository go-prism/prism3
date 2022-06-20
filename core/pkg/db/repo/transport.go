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
	"gorm.io/gorm"
)

func NewTransportRepo(db *gorm.DB) *TransportRepo {
	return &TransportRepo{
		db: db,
	}
}

func (r *TransportRepo) CreateTransport(ctx context.Context, in *model.NewTransportProfile) (*model.TransportSecurity, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("creating transport")
	result := model.TransportSecurity{
		Name:          in.Name,
		Ca:            in.Ca,
		Cert:          in.Cert,
		Key:           in.Key,
		SkipTLSVerify: in.SkipTLSVerify,
		HTTPProxy:     in.HTTPProxy,
		HTTPSProxy:    in.HTTPSProxy,
		NoProxy:       in.NoProxy,
	}
	if err := r.db.WithContext(ctx).Create(&result).Error; err != nil {
		log.Error(err, "failed to create transport")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to create transport")
	}
	return &result, nil
}

func (r *TransportRepo) ListTransports(ctx context.Context) ([]*model.TransportSecurity, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing transports")
	var result []*model.TransportSecurity
	if err := r.db.WithContext(ctx).Find(&result).Error; err != nil {
		log.Error(err, "failed to list transports")
		sentry.CaptureException(err)
		return nil, returnErr(err, "failed to list transports")
	}
	return result, nil
}
