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

package remote

import (
	"context"
	_ "embed"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"gitlab.com/go-prism/prism3/core/pkg/quota"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

//go:embed testdata/job.json
var jobJSON string

func TestBackedRemote_DownloadGitLab(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{
		Verbosity: 10,
	}))
	r := mux.NewRouter()
	r.HandleFunc("/api/v4/packages/generic/file.txt", func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Job-Token")
		if token == "" || token == "test" {
			http.Error(w, "Unauthorised", http.StatusUnauthorized)
		}
		_, _ = io.WriteString(w, "Test")
	})
	r.HandleFunc("/api/v4/job", func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Job-Token")
		if token == "test" {
			http.Error(w, "error", http.StatusUnauthorized)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, jobJSON)
	})
	ts := httptest.NewServer(r)
	defer ts.Close()

	store := storage.NewNoOp()
	rem := NewBackedRemote(ctx, &model.Remote{
		URI: fmt.Sprintf("%s/%s", ts.URL, "api/v4/packages/generic"),
		Security: &model.RemoteSecurity{
			AuthMode:    model.AuthModeProxy,
			AuthHeaders: []string{"Job-Token", "Private-Token", "Deploy-Token"},
		},
		Archetype: model.ArchetypeGeneric,
	}, store, &quota.NoopObserver{}, func(ctx context.Context, path, remote string) error {
		return nil
	}, getPkg, getPkg)

	// download
	_, err := rem.Download(ctx, "/file.txt", &schemas.RequestContext{
		PartitionID: "",
		AuthOpts: httpclient.AuthOpts{
			Mode:   httpclient.AuthHeader,
			Header: "Job-Token",
			Token:  "password",
		},
	})
	assert.NoError(t, err)
	t.Log("fetching same file again, it should be cached")
	_, err = rem.Download(ctx, "/file.txt", &schemas.RequestContext{
		PartitionID: "",
		AuthOpts: httpclient.AuthOpts{
			Mode:   httpclient.AuthHeader,
			Header: "Job-Token",
			Token:  "hunter2",
		},
	})
	assert.NoError(t, err)
}
