package partition

import (
	"context"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
)

type NoOpPartition struct{}

func (*NoOpPartition) Apply(ctx context.Context, _ RemoteLike, _, value string) (string, bool) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "partition_noop_apply")
	defer span.End()
	return value, false
}
