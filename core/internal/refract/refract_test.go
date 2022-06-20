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

package refract

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/lpar/problem"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"net/http"
	"net/http/httptest"
	"testing"
)

func singleCodeServer(t *testing.T, code int) *httptest.Server {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(code)
	}))
	t.Cleanup(ts.Close)

	return ts
}

func TestRefraction_Exists(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))

	notFound := singleCodeServer(t, http.StatusNotFound)
	serverError := singleCodeServer(t, http.StatusInternalServerError)
	forbiddenError := singleCodeServer(t, http.StatusForbidden)

	var cases = []struct {
		name string
		ref  *Refraction
		code int
	}{
		{
			"server error is preferred over fallback",
			NewSimple(ctx, "", []remote.Remote{
				remote.NewEphemeralRemote(ctx, notFound.URL, nil),
				remote.NewEphemeralRemote(ctx, serverError.URL, nil),
			}),
			http.StatusInternalServerError,
		},
		{
			"404 is used if no alternative",
			NewSimple(ctx, "", []remote.Remote{
				remote.NewEphemeralRemote(ctx, notFound.URL, nil),
				remote.NewEphemeralRemote(ctx, notFound.URL, nil),
			}),
			http.StatusNotFound,
		},
		{
			"client errors are preferred",
			NewSimple(ctx, "", []remote.Remote{
				remote.NewEphemeralRemote(ctx, notFound.URL, nil),
				remote.NewEphemeralRemote(ctx, serverError.URL, nil),
				remote.NewEphemeralRemote(ctx, forbiddenError.URL, nil),
			}),
			http.StatusForbidden,
		},
	}

	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			msg, err := tt.ref.Exists(ctx, "", &schemas.RequestContext{})
			assert.Error(t, err)
			assert.Nil(t, msg)

			w := httptest.NewRecorder()
			require.NoError(t, problem.Write(w, err))

			assert.EqualValues(t, tt.code, w.Code)
		})
	}
}
