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

package cache

import (
	"go.opentelemetry.io/otel/metric/global"
	"go.opentelemetry.io/otel/metric/instrument"
	"go.opentelemetry.io/otel/metric/unit"
)

var (
	meter             = global.MeterProvider().Meter("prism")
	metricGetCount, _ = meter.SyncInt64().Counter(
		"prism.goproxy.cache.get.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricPutCount, _ = meter.SyncInt64().Counter(
		"prism.goproxy.cache.put.total",
		instrument.WithUnit(unit.Dimensionless),
	)
)
