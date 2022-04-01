package v1

import (
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"net/http/httputil"
	"sync"
)

type Gateway struct {
	resolver resolver.IResolver
	pool     *sync.Pool
	npmPool  *sync.Pool

	goProxy *httputil.ReverseProxy
}
