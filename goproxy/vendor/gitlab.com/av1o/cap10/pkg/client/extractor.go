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
	"context"
	"fmt"
	"github.com/djcass44/go-tracer/tracer"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

var (
	DefaultSubjectHeader    = http.CanonicalHeaderKey("X-Auth-User")
	DefaultIssuerHeader     = http.CanonicalHeaderKey("X-Auth-Source")
	DefaultVerifyHeader     = http.CanonicalHeaderKey("X-Auth-Verify")
	DefaultVerifyHashHeader = http.CanonicalHeaderKey("X-Auth-Hash-Verify")
	DefaultClaimPrefix      = "X-Auth-"
)

// GetClaim creates a UserClaim from a given http.Request
func GetClaim(r *http.Request) (*ChainClaim, error) {
	id := tracer.GetRequestId(r)
	sub := r.Header.Get(DefaultSubjectHeader)
	iss := r.Header.Get(DefaultIssuerHeader)
	subjects := getPieces(sub)
	issuers := getPieces(iss)
	if len(subjects) == 0 || len(issuers) == 0 {
		log.WithField("id", id).Error("cannot get user claim when sub or iss have 0 segments")
		return nil, ErrMissingUser
	}
	claims := getClaims(&r.Header)
	log.WithField("id", id).Debugf("located %d claims", len(claims))
	user := &ChainClaim{
		Subjects:  subjects,
		Issuers:   issuers,
		Token:     r.Header.Get(DefaultVerifyHeader),
		TokenHash: r.Header.Get(DefaultVerifyHashHeader),
		RawClaim:  fmt.Sprintf("%s/%s", iss, sub),
		Claims:    claims,
	}
	log.WithFields(log.Fields{"user": user, "id": id}).Debug("located user in request")
	return user, nil
}

// GetOriginalClaim returns the 1st user within a chain as a new UserClaim
func (uc *ChainClaim) GetOriginalClaim(ctx context.Context) (*UserClaim, error) {
	id := tracer.GetContextId(ctx)
	if len(uc.Subjects) == 0 || len(uc.Issuers) == 0 {
		log.WithField("id", id).Error("cannot get original claim when sub or iss have 0 segments")
		return nil, ErrMissingUser
	}
	return &UserClaim{
		Sub:       uc.Subjects[0],
		Iss:       uc.Issuers[0],
		Token:     uc.Token,
		TokenHash: uc.TokenHash,
		Claims:    uc.Claims,
	}, nil
}

// getPieces removes a chains delimiters e.g. <user1><user2> -> ["user1", "user2"]
func getPieces(chain string) []string {
	var items []string
	segs := strings.Split(chain, ">")
	for _, s := range segs {
		// trim whitespace and remove the leading <
		i := strings.TrimPrefix(strings.TrimSpace(s), "<")
		// only add this segment if it's not an empty string
		if i != "" {
			items = append(items, strings.TrimSpace(i))
		}
	}
	return items
}

func getClaims(h *http.Header) map[string]string {
	claims := map[string]string{}
	for k := range *h {
		// don't copy our main headers
		if k == DefaultIssuerHeader || k == DefaultVerifyHashHeader || k == DefaultVerifyHeader || k == DefaultSubjectHeader {
			continue
		}
		if strings.HasPrefix(k, DefaultClaimPrefix) {
			claims[strings.TrimPrefix(k, DefaultClaimPrefix)] = h.Get(k)
		}
	}
	return claims
}
