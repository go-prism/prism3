package refract

import (
	"errors"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"sync"
)

var ErrNotFound = errors.New("object could not be found in any remote")

type Refraction struct {
	name    string
	remotes []remote.Remote
	rp      *sync.Pool
}

type Message struct {
	URI    string
	Remote remote.Remote
}
