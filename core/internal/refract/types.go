package refract

import (
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"sync"
)

type Refraction struct {
	name    string
	remotes []remote.Remote
	rp      *sync.Pool
}

type Message struct {
	URI    string
	Remote remote.Remote
}
