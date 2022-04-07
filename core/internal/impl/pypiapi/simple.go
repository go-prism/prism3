package pypiapi

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"golang.org/x/net/html"
	"html/template"
	"io"
	"sync"
)

//go:embed index.html.tpl
var indexTemplate string

func NewProvider(repos *repo.Repos, publicURL string) *Provider {
	return &Provider{
		publicURL: publicURL,
		repos:     repos,
	}
}

func (p *Provider) Index(ctx context.Context, ref *refract.Refraction, pkg string) (io.Reader, error) {
	items := p.fetch(ctx, ref, pkg)

	// template our response
	idx := Index{Package: pkg, Items: items, PublicURL: p.publicURL, Ref: ref.String()}
	tmpl := template.Must(template.New("index").Parse(indexTemplate))
	buf := bytes.NewBuffer(nil)
	if err := tmpl.Execute(buf, idx); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to generate index.html template")
		return nil, err
	}
	return bytes.NewReader(buf.Bytes()), nil
}

func (p *Provider) fetch(ctx context.Context, ref *refract.Refraction, pkg string) []*schemas.PyPackage {
	remotes := ref.Remotes()
	var items []*schemas.PyPackage

	// create a mutex so we
	// can safely collect package info
	s := &sync.Mutex{}
	wg := sync.WaitGroup{}
	log.WithContext(ctx).Infof("fetching PyPi metadata for '%s' from %d remotes (%s)", pkg, len(remotes), ref.String())
	for i := range remotes {
		wg.Add(1)
		j := i
		// download the document
		go func() {
			defer wg.Done()
			resp, err := remotes[j].Download(ctx, fmt.Sprintf("/%s/", pkg))
			if err != nil {
				return
			}
			packages, err := p.parse(ctx, pkg, resp)
			if err != nil {
				return
			}
			// save the packages
			_ = p.repos.PyPackageRepo.BatchInsert(ctx, packages)
			// add our packages to the list
			s.Lock()
			items = append(items, packages...)
			s.Unlock()
		}()
	}
	// wait for all responses
	wg.Wait()
	return items
}

func (p *Provider) parse(ctx context.Context, pkg string, r io.Reader) ([]*schemas.PyPackage, error) {
	doc, err := html.Parse(r)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to parse html")
		return nil, err
	}
	var packages []*schemas.PyPackage
	var f func(node *html.Node)
	f = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == "a" {
			pack := &schemas.PyPackage{
				Name: pkg,
			}
			// collect the filename
			if node.FirstChild != nil {
				pack.Filename = node.FirstChild.Data
			}
			// extract attributes
			for _, a := range node.Attr {
				switch a.Key {
				case "href":
					pack.URL = a.Val
				case "data-requires-python":
					pack.RequiresPython = a.Val
				case "data-gpg-sig":
					pack.Signed = a.Val == "true"
				}
				if a.Key == "href" {
					pack.URL = a.Val
				}
			}
			// only save the package if we got
			// the information needed
			if pack.URL != "" && pack.Filename != "" {
				packages = append(packages, pack)
			}
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)
	return packages, err
}
