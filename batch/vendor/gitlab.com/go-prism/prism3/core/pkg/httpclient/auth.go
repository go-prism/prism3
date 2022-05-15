package httpclient

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"net/http"
)

type AuthMode int

const (
	AuthNone          AuthMode = iota
	AuthAuthorization AuthMode = iota
	AuthHeader        AuthMode = iota
)

type AuthOpts struct {
	Mode   AuthMode
	Header string
	Token  string
}

func ApplyAuth(ctx context.Context, r *http.Request, opt AuthOpts) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "http_auth", trace.WithAttributes(
		attribute.Int("mode", int(opt.Mode)),
		attribute.String("header", opt.Header),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Options", opt)
	log.V(1).Info("applying authentication")
	switch opt.Mode {
	case AuthHeader:
		log.V(2).Info("setting authentication header", "Header", opt.Header)
		r.Header.Set(opt.Header, opt.Token)
	case AuthAuthorization:
		log.V(2).Info("setting authentication header", "Header", "Authorization")
		r.Header.Set("Authorization", opt.Token)
	case AuthNone:
		fallthrough
	default:
		return
	}
}
