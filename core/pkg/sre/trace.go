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

package sre

import (
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/trace"
)

// TraceHook includes the OpenTelemetry
// TraceID and SpanID in every log statement
type TraceHook struct{}

func (*TraceHook) Fire(entry *log.Entry) error {
	newData := make(log.Fields, len(entry.Data)+2)
	for k, v := range entry.Data {
		newData[k] = v
	}
	if entry.Context != nil {
		span := trace.SpanFromContext(entry.Context)
		newData[DataKeyTraceID] = span.SpanContext().TraceID().String()
		newData[DataKeySpanID] = span.SpanContext().SpanID().String()
	}
	entry.Data = newData
	return nil
}

func (*TraceHook) Levels() []log.Level {
	return log.AllLevels
}
