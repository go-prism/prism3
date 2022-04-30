package flag

import (
	"context"
	flagctx "github.com/Unleash/unleash-client-go/v3/context"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
)

func Context(parent context.Context) (ctx flagctx.Context) {
	parent, span := otel.Tracer(tracing.DefaultTracerName).Start(parent, "unleash_context_convert")
	defer span.End()
	user, ok := client.GetContextUser(parent)
	if !ok {
		return ctx
	}
	ctx.UserId = user.AsUsername()
	ctx.Properties = user.Claims
	if ctx.Properties == nil {
		ctx.Properties = map[string]string{}
	}
	ctx.Properties["user_sub"] = user.Sub
	ctx.Properties["user_iss"] = user.Iss
	return
}
