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
	"errors"
	"fmt"
)

var (
	ErrMissingUser = errors.New("sub or iss has 0 segments")
)

type BaseVerifier interface {
	IsValid(ctx context.Context, msg, sig, sigHash string) bool
}

type UserClaim struct {
	Sub       string            `json:"sub"`        // unique id or DN
	Iss       string            `json:"iss"`        // id of issuer (e.g. OIDC url) or DN of CA
	Token     string            `json:"token"`      // authenticity token
	TokenHash string            `json:"token_hash"` // hash of key used to sign authenticity token
	Claims    map[string]string `json:"claims"`
}

func (uc *UserClaim) AsUsername() string {
	return fmt.Sprintf("%s/%s", uc.Iss, uc.Sub)
}

type ChainClaim struct {
	Subjects  []string          `json:"subjects"`
	Issuers   []string          `json:"issuers"`
	Token     string            `json:"token"`
	TokenHash string            `json:"token_hash"` // hash of key used to sign authenticity token
	RawClaim  string            `json:"raw_claim"`
	Claims    map[string]string `json:"claims"`
}
