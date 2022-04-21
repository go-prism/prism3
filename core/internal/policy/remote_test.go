package policy

import (
	"context"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"testing"
)

func TestRegexEnforcer_CanCache(t *testing.T) {
	var cases = []struct {
		arch model.Archetype
		path string
		ok   bool
	}{
		{
			model.ArchetypeGeneric,
			"/index.html",
			false,
		},
		{
			model.ArchetypeGeneric,
			"/foo/bar/package.tgz",
			true,
		},
		{
			model.ArchetypeAlpine,
			"/foo/bar/APKINDEX.tar.gz",
			false,
		},
		{
			model.ArchetypeMaven,
			"/foo/bar/library.jar",
			true,
		},
	}
	for _, tt := range cases {
		t.Run(tt.path, func(t *testing.T) {
			enf := NewRegexEnforcer(&model.Remote{
				Archetype: tt.arch,
				Security:  &model.RemoteSecurity{},
			})
			ok := enf.CanCache(context.TODO(), tt.path)
			assert.EqualValues(t, tt.ok, ok)
		})
	}
}
