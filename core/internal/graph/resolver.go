package graph

import "gitlab.com/go-prism/prism3/core/internal/db/repo"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	repos *repo.Repos
}

func NewResolver(repos *repo.Repos) *Resolver {
	return &Resolver{
		repos: repos,
	}
}
