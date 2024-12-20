package npmapi

import (
	"context"
	_ "embed"
	"github.com/stretchr/testify/assert"
	"testing"
)

//go:embed testdata/tiny-tarball-1.0.0.json
var input string

//go:embed testdata/tiny-tarball-1.0.0a.json
var output string

func TestProvider_rewriteURLs(t *testing.T) {
	p := &Provider{
		publicURL: "https://prism3.devel",
	}
	data := p.rewriteURLs(context.TODO(), []string{"https://registry.npmjs.org"}, "npm", input)
	assert.JSONEq(t, output, data)
}
