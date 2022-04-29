package httpclient

import (
	"context"
	log "github.com/sirupsen/logrus"
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
