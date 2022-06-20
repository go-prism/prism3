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

package resolver

import (
	"context"
	"fmt"
	embeddedpostgres "github.com/fergusstrange/embedded-postgres"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"testing"
)

func newPostgres(t *testing.T) {
	postgres := embeddedpostgres.NewDatabase(embeddedpostgres.DefaultConfig().
		//BinaryRepositoryURL("https://prism.v2.dcas.dev/api/v1/maven/-").
		Username("prism").
		Password("hunter2").
		Database("prism").
		Version(embeddedpostgres.V14).
		BinariesPath(t.TempDir()).
		DataPath(t.TempDir()).
		RuntimePath(t.TempDir()),
	)
	require.NoError(t, postgres.Start())
	// cleanup when we're done
	t.Cleanup(func() {
		_ = postgres.Stop()
	})
}

func TestResolver_Resolve(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))

	newPostgres(t)

	// setup database
	database, err := db.NewDatabase(ctx, fmt.Sprintf("user=prism password=hunter2 dbname=prism host=localhost port=5432 sslmode=disable"))
	require.NoError(t, err)
	require.NoError(t, database.Init())

	// setup infra
	repos := repo.NewRepos(database.DB())
	rem, err := repos.RemoteRepo.CreateRemote(ctx, &model.NewRemote{
		Name:      "generic-github",
		URI:       "https://github.com",
		Archetype: model.ArchetypeGeneric,
		Transport: "",
		AuthMode:  "",
	})
	require.NoError(t, err)
	_, err = repos.RemoteRepo.PatchRemote(ctx, rem.ID, &model.PatchRemote{
		Blocked: []string{"^/?(super-secret).+"},
	})
	require.NoError(t, err)
	_, err = repos.RefractRepo.CreateRefraction(ctx, &model.NewRefract{
		Name:      "generic",
		Archetype: model.ArchetypeGeneric,
		Remotes:   []string{rem.ID},
	})
	require.NoError(t, err)

	// set up the resolver
	r := NewResolver(ctx, repos, storage.NewNoOp(), "https://prism.example.org")
	assert.NotNil(t, r)

	// attempt to fetch something
	t.Run("normal file", func(t *testing.T) {
		_, err = r.Resolve(ctx, &Request{
			bucket: "generic",
			path:   "GoogleContainerTools/skaffold/releases/download/v1.37.2/VERSION",
		}, &schemas.RequestContext{})
		assert.NoError(t, err)
	})
	t.Run("blocked file", func(t *testing.T) {
		_, err = r.Resolve(ctx, &Request{
			bucket: "generic",
			path:   "super-secret/file.txt",
		}, &schemas.RequestContext{})
		assert.Error(t, err)
	})
}
