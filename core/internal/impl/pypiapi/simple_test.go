package pypiapi

import (
	"bytes"
	"context"
	_ "embed"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/schemas"
	"html/template"
	"strings"
	"testing"
)

//go:embed testdata/requests.html
var requestsData string

func TestProvider_Parse(t *testing.T) {
	p := new(Provider)
	packages, err := p.parse(context.TODO(), "requests", strings.NewReader(requestsData))
	assert.NoError(t, err)
	assert.Len(t, packages, 208)
}

func TestProvider_Index(t *testing.T) {
	tmpl := template.Must(template.New("index").Parse(indexTemplate))
	buf := bytes.NewBuffer(nil)
	err := tmpl.Execute(buf, Index{Package: "requests", Items: []*schemas.PyPackage{
		{
			Name:     "requests",
			Filename: "requests-0.2.0.tar.gz",
			URL:      "https://files.pythonhosted.org/packages/ba/bb/dfa0141a32d773c47e4dede1a617c59a23b74dd302e449cf85413fc96bc4/requests-0.2.0.tar.gz#sha256=813202ace4d9301a3c00740c700e012fb9f3f8c73ddcfe02ab558a8df6f175fd",
		},
		{
			Name:     "requests",
			Filename: "requests-0.2.1.tar.gz",
			URL:      "https://files.pythonhosted.org/packages/4b/ad/d536b2e572e843fda13e4458c67f937b05ce359722c1e4cdad35ba05b6e3/requests-0.2.1.tar.gz#sha256=d54eb33499f018fc6bd297613bf866f8d134629c8e02964aab6ef951f460e41e",
			Signed:   true,
		},
		{
			Name:           "requests",
			Filename:       "requests-0.2.2.tar.gz",
			URL:            "https://files.pythonhosted.org/packages/82/3c/3b5beca192da920c0c2ba67119d66ba1e4b1e766f40898e5e684d697ca1c/requests-0.2.2.tar.gz#sha256=b3289694b2ddf6adb4f7e1f470b9771330c76125611222b9c702f0e2e9733cbc",
			RequiresPython: "&gt;3",
		},
	}, PublicURL: "https://prism.devel", Ref: "pypi-test"})
	assert.NoError(t, err)
	t.Log(buf.String())
}
