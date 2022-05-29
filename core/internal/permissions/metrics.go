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

package permissions

import (
	"go.opentelemetry.io/otel/metric/global"
	"go.opentelemetry.io/otel/metric/instrument"
	"go.opentelemetry.io/otel/metric/unit"
)

var (
	meter        = global.MeterProvider().Meter("prism")
	metricCan, _ = meter.SyncInt64().Counter(
		"prism.core.rbac.can.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricHas, _ = meter.SyncInt64().Counter(
		"prism.core.rbac.has.total",
		instrument.WithUnit(unit.Dimensionless),
	)
)
