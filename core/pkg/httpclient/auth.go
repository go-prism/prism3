package httpclient

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
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
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "http_auth")
	defer span.End()
	log.WithContext(ctx).WithFields(log.Fields{
		"mode":   opt.Mode,
		"header": opt.Header,
	}).Debug("applying authentication")
	switch opt.Mode {
	case AuthHeader:
		r.Header.Set(opt.Header, opt.Token)
	case AuthAuthorization:
		r.Header.Set("Authorization", opt.Token)
	case AuthNone:
		fallthrough
	default:
		return
	}
}
