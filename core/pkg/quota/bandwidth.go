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

package quota

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"time"
)

func NewNetObserver(ctx context.Context, repo *repo.BandwidthRepo) *NetObserver {
	log := logr.FromContextOrDiscard(ctx).WithName("observer.net")
	log.V(2).Info("starting network observer")
	o := &NetObserver{
		repo:    repo,
		log:     log,
		buckets: map[model.BandwidthType]map[string]int64{},
	}

	go func() {
		for {
			time.Sleep(time.Second * 10)
			o.flush()
		}
	}()

	return o
}

func (o *NetObserver) Observe(resource string, usage int64, bandwidthType model.BandwidthType) {
	o.log.V(5).Info("adding network observation", "Resource", resource, "Usage", usage)
	m, ok := o.buckets[bandwidthType]
	if !ok {
		m = map[string]int64{}
	}
	m[resource] += usage
	o.buckets[bandwidthType] = m
}

func (o *NetObserver) flush() {
	log := o.log
	ctx := logr.NewContext(context.TODO(), log)
	log.V(3).Info("flushing cache", "Buckets", len(o.buckets))
	for t, v := range o.buckets {
		for k, vv := range v {
			_ = o.repo.Create(ctx, k, vv, t)
		}
	}
	o.buckets = map[model.BandwidthType]map[string]int64{}
}
