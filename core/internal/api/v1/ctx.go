package v1

import (
	"context"
	"github.com/djcass44/go-utils/utilities/sliceutils"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"net/http"
)

var knownAuthHeaders = []string{
	"Authorization",
	"Private-Token",
	"Deploy-Token",
	"Job-Token",
}

func GetRequestContext(ctx context.Context, r *http.Request) *schemas.RequestContext {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "gateway_getRequestContext")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	var header, token string
	mode := httpclient.AuthNone
	for k := range r.Header {
		log.V(3).Info("checking if header is auth-related", "Name", k, "Value", r.Header.Get(k))
		if sliceutils.Includes(knownAuthHeaders, k) {
			log.V(2).Info("detected authentication-related header", "Name", k)
			header = k
			token = r.Header.Get(k)
			mode = httpclient.AuthHeader
			break
		}
	}
	log.V(1).Info("detected authentication context", "Mode", mode, "Header", header)
	return &schemas.RequestContext{
		AuthOpts: httpclient.AuthOpts{
			Mode:   mode,
			Header: header,
			Token:  token,
		},
	}
}
