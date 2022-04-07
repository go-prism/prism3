package helmidx

import (
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
)

type HelmProcessor struct {
	repos *repo.Repos
	store storage.Reader
}
