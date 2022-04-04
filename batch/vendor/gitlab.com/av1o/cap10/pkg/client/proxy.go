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
	"github.com/djcass44/go-tracer/tracer"
	"net/http"
	"strings"
)

// CopyTo copies user information from a source http.Request to a destination one
// this function is useful when proxying requests from one service to another and retaining user information
func CopyTo(src, dst *http.Request) {
	// copy the user headers
	dst.Header.Add(DefaultSubjectHeader, src.Header.Get(DefaultSubjectHeader))
	dst.Header.Add(DefaultIssuerHeader, src.Header.Get(DefaultIssuerHeader))
	dst.Header.Add(DefaultVerifyHeader, src.Header.Get(DefaultVerifyHeader))
	dst.Header.Add(DefaultVerifyHashHeader, src.Header.Get(DefaultVerifyHashHeader))
	// copy the user claims
	for k := range src.Header {
		if strings.HasPrefix(k, DefaultClaimPrefix) {
			dst.Header.Set(k, src.Header.Get(k))
		}
	}
	// copy the request id for tracing
	requestID := tracer.GetRequestId(src)
	if requestID != "" {
		dst.Header.Add(tracer.DefaultRequestHeader, requestID)
	}
}
