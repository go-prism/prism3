package v1

import (
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"sync"
)

type Gateway struct {
	resolver *resolver.Resolver
	pool     *sync.Pool
}
