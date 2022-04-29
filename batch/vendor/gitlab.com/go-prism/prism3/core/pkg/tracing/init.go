/*
 *    Copyright 2021 Django Cass
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

package tracing

import (
	"context"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	"os"
	"os/signal"
	"runtime"
	"syscall"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

type OtelOptions struct {
	Environment string  `split_words:"true" envconfig:"GITLAB_ENVIRONMENT_NAME"`
	SampleRate  float64 `split_words:"true" default:"0.05"`
}

func Init(opts *OtelOptions) error {
	exporter, err := jaeger.New(jaeger.WithCollectorEndpoint())
	if err != nil {
		log.WithError(err).Error("failed to setup otel exporter")
		return err
	}
	host, err := os.Hostname()
	if err != nil {
		log.WithError(err).Error("failed to retrieve system hostname")
		host = "unknown"
	}
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.TraceIDRatioBased(opts.SampleRate)),
		sdktrace.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String(DefaultServiceName),
			attribute.String("environment", opts.Environment),
			attribute.String("os", runtime.GOOS),
			attribute.String("arch", runtime.GOARCH),
			attribute.String("hostname", host),
			attribute.String("go_version", runtime.Version()),
		)),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	go waitForShutdown(tp)

	return nil
}

func waitForShutdown(tp *sdktrace.TracerProvider) {
	sigC := make(chan os.Signal, 1)
	signal.Notify(sigC, syscall.SIGTERM, syscall.SIGINT)
	<-sigC
	if err := tp.Shutdown(context.Background()); err != nil {
		log.WithError(err).Error("failed to shutdown otel tracer provider")
	}
}
