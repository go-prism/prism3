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

package client

import (
	"github.com/go-logr/logr"
	"net/http"
	"strings"
)

var copyable = []string{
	DefaultSubjectHeader,
	DefaultIssuerHeader,
	DefaultVerifyHeader,
	DefaultVerifyHashHeader,
}

// CopyTo copies user information from a source http.Request to a destination one
// this function is useful when proxying requests from one service to another and retaining user information
func CopyTo(src, dst *http.Request) {
	log := logr.FromContextOrDiscard(src.Context())
	// copy the user headers
	for _, h := range copyable {
		log.V(2).Info("copying header", "Header", h, "Value", src.Header.Get(h))
		dst.Header.Add(h, src.Header.Get(h))
	}
	// copy the user claims
	for k := range src.Header {
		if strings.HasPrefix(k, DefaultClaimPrefix) {
			log.V(2).Info("copying claim", "Header", k, "Value", src.Header.Get(k))
			dst.Header.Set(k, src.Header.Get(k))
		}
	}
}
