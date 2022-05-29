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

package storage

import (
	"go.opentelemetry.io/otel/metric/global"
	"go.opentelemetry.io/otel/metric/instrument"
	"go.opentelemetry.io/otel/metric/unit"
)

var (
	meter            = global.MeterProvider().Meter("prism")
	metricGetSize, _ = meter.SyncInt64().Counter(
		"storage.s3.get.total",
		instrument.WithUnit(unit.Bytes),
	)
	metricGetErrCount, _ = meter.SyncInt64().Counter(
		"storage.s3.get.error.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricPutCount, _ = meter.SyncInt64().Counter(
		"storage.s3.put.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricPutErrCount, _ = meter.SyncInt64().Counter(
		"storage.s3.put.error.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricHeadCount, _ = meter.SyncInt64().Counter(
		"storage.s3.head.total",
		instrument.WithUnit(unit.Dimensionless),
	)
	metricHeadErrCount, _ = meter.SyncInt64().Counter(
		"storage.s3.head.error.total",
		instrument.WithUnit(unit.Dimensionless),
	)
)

const (
	attributeKeyPath   = "aws.s3.path"
	attributeKeyBucket = "aws.s3.bucket"
)
