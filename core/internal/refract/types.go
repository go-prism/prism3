package refract

import (
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"sync"
)

type Refraction struct {
	remotes []remote.Remote
	rp      sync.Pool
}
