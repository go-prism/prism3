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

package remote

import (
	"go.opentelemetry.io/otel/metric/global"
	"go.opentelemetry.io/otel/metric/instrument"
	"go.opentelemetry.io/otel/metric/unit"
)

var (
	meter               = global.MeterProvider().Meter("prism")
	metricDoDuration, _ = meter.SyncInt64().Counter(
		"remote.ephemeral.do.duration.total",
		instrument.WithUnit(unit.Milliseconds),
	)
	metricDoCancel, _ = meter.SyncInt64().Counter(
		"remote.ephemeral.do.cancelled.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricDoOk, _ = meter.SyncInt64().Counter(
		"remote.ephemeral.do.success.total",
		instrument.WithUnit(unit.Dimensionless),
	)

	metricBackedAuth, _ = meter.SyncInt64().Counter(
		"remote.backed.auth.total",
		instrument.WithUnit(unit.Dimensionless),
	)
)

const (
	attributeAuthKey = "prism.auth.mode"
)
