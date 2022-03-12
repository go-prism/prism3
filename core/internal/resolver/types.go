package resolver

import "gitlab.com/go-prism/prism3/core/internal/refract"

type Resolver struct {
	refractions []*refract.Refraction
}

type Request struct {
	bucket string
	path   string
}
