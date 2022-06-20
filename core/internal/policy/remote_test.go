/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package policy

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"testing"
)

func TestRegexEnforcer_CanReceive(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))
	var cases = []struct {
		path string
		ok   bool
	}{
		{
			"/foo/bar/library.jar",
			true,
		},
		{
			"/super-secret/library.jar",
			false,
		},
		{
			"super-secret/library.jar",
			false,
		},
	}
	for _, tt := range cases {
		t.Run(tt.path, func(t *testing.T) {
			enf := NewRegexEnforcer(ctx, &model.Remote{
				Archetype: model.ArchetypeGeneric,
				Security: &model.RemoteSecurity{
					Blocked: []string{
						"^/?(super-secret)|(very-secret).+",
					},
				},
			})
			ok := enf.CanReceive(ctx, tt.path)
			assert.EqualValues(t, tt.ok, ok)
		})
	}
}

func TestRegexEnforcer_CanCache(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))
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
			enf := NewRegexEnforcer(ctx, &model.Remote{
				Archetype: tt.arch,
				Security:  &model.RemoteSecurity{},
			})
			ok := enf.CanCache(ctx, tt.path)
			assert.EqualValues(t, tt.ok, ok)
		})
	}
}
