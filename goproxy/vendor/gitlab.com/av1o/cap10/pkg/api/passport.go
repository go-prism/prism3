/*
 *    Copyright 2020 Django Cass
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

package api

import (
	"github.com/djcass44/go-tracer/tracer"
	"github.com/djcass44/go-utils/utilities/httputils"
	"github.com/go-logr/logr"
	"github.com/gorilla/mux"
	"gitlab.com/av1o/cap10/pkg/passport"
	"net/http"
)

func AddPassportRoute(kp *passport.KeyProvider, r *mux.Router) error {
	key, err := kp.ToString()
	if err != nil {
		return err
	}
	keyHash := kp.GetPublicKeyHash()
	dto := PassportDTO{
		Version:       1,
		PublicKey:     key,
		PublicKeyHash: keyHash,
	}
	r.HandleFunc("/.well-known/cap10.json", tracer.NewFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logr.FromContextOrDiscard(r.Context())
		log.V(1).Info("answering configuration request", "RemoteAddr", r.RemoteAddr, "UserAgent", r.UserAgent())
		// write back our response
		httputils.ReturnJSON(r.Context(), w, http.StatusOK, &dto)
	})).Methods(http.MethodGet)
	return nil
}
