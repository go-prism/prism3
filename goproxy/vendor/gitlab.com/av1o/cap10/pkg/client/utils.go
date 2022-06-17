/*
 *    Copyright 2021 Django Cass
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
	"github.com/go-logr/logr"
	"net/http"
)

type key int

const (
	UserContextKey  key = iota
	ChainContextKey key = iota
)

// Client provides simple utilities for extracting a user from an incoming request
type Client struct {
	v BaseVerifier
}

// NewClient creates a new instance of Client
func NewClient(v BaseVerifier) *Client {
	as := new(Client)
	as.v = v

	return as
}

// WithOptionalUser provides a http.Handler for
// injecting user information into the request context.Context
// if it is given.
func (c *Client) WithOptionalUser(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var ctx context.Context
		chain, user, err := c.getChain(r)
		if err == nil {
			ctx = context.WithValue(r.Context(), UserContextKey, user)
			ctx = context.WithValue(ctx, ChainContextKey, chain)
		} else {
			ctx = r.Context()
		}
		h.ServeHTTP(w, r.WithContext(ctx))
	})
}

// WithUser provides a http.Handler for injecting user information into the request Context
func (c *Client) WithUser(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		chain, user, err := c.getChain(r)
		if err != nil {
			http.Error(w, "Unauthorised", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		ctx = context.WithValue(ctx, ChainContextKey, chain)
		h.ServeHTTP(w, r.WithContext(ctx))
	})
}

// WithOptionalUserFunc provides a http handler function for
// injecting user information into the request context.Context
// if it is given.
func (c *Client) WithOptionalUserFunc(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var ctx context.Context
		chain, user, err := c.getChain(r)
		if err == nil {
			ctx = context.WithValue(r.Context(), UserContextKey, user)
			ctx = context.WithValue(ctx, ChainContextKey, chain)
		} else {
			ctx = r.Context()
		}
		f(w, r.WithContext(ctx))
	}
}

// WithUserFunc provides a http handler function for injecting user information into the request Context
func (c *Client) WithUserFunc(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		chain, user, err := c.getChain(r)
		if err != nil {
			http.Error(w, "Unauthorised", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		ctx = context.WithValue(ctx, ChainContextKey, chain)
		f(w, r.WithContext(ctx))
	}
}

// getChain extracts the user chain from a given request
func (c *Client) getChain(r *http.Request) (*ChainClaim, *UserClaim, error) {
	log := logr.FromContextOrDiscard(r.Context())
	userChain, err := GetClaim(r)
	if err != nil {
		log.Error(err, "failed to locate user claim in request")
		return nil, nil, err
	}
	user, err := userChain.GetOriginalClaim(r.Context())
	if err != nil {
		log.Error(err, "failed to locate original user within chain")
		return nil, nil, err
	}
	// check that the authenticity token is valid
	if !c.v.IsValid(r.Context(), userChain.RawClaim, userChain.Token, userChain.TokenHash) {
		log.Info("user failed authenticity check", "Token", userChain.Token, "Hash", userChain.TokenHash)
		return nil, nil, err
	}
	log.V(1).Info("authenticity token validation passed", "Hash", userChain.TokenHash)
	return userChain, user, nil
}

// getUser extracts the user from a given request
func (c *Client) getUser(r *http.Request) (user *UserClaim, err error) {
	_, user, err = c.getChain(r)
	return
}

// GetRequestingUser returns the user saved into the given http.Request.
//
// May return nil if not processed by a Client.
func GetRequestingUser(r *http.Request) (*UserClaim, bool) {
	log := logr.FromContextOrDiscard(r.Context())
	log.V(2).Info("retrieving user from request", "Key", UserContextKey)
	v := r.Context().Value(UserContextKey)
	return castUser(v)
}

// GetRequestingChain returns the user-chain saved into
// the given http.Request.
//
// May return nil if not processed by a Client.
func GetRequestingChain(r *http.Request) (*ChainClaim, bool) {
	log := logr.FromContextOrDiscard(r.Context())
	log.V(2).Info("retrieving chain from request", "Key", ChainContextKey)
	v := r.Context().Value(ChainContextKey)
	return castChain(v)
}

// GetContextUser returns the user saved into the given context.Context.
//
// May return nil if not processed by a Client.
func GetContextUser(ctx context.Context) (*UserClaim, bool) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(2).Info("retrieving user from context", "Key", UserContextKey)
	v := ctx.Value(UserContextKey)
	return castUser(v)
}

// GetContextChain returns the user-chain saved into
// the given context.Context.
//
// May return nil if not processed by a Client.
func GetContextChain(ctx context.Context) (*ChainClaim, bool) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(2).Info("retrieving chain from context", "Key", ChainContextKey)
	v := ctx.Value(ChainContextKey)
	return castChain(v)
}

// castUser casts an interface to a UserClaim
// and returns whether the cast succeeded
func castUser(v interface{}) (*UserClaim, bool) {
	s, ok := v.(*UserClaim)
	return s, ok
}

// castChain casts an interface to a ChainClaim
// and returns whether the cast succeeded
func castChain(v interface{}) (*ChainClaim, bool) {
	s, ok := v.(*ChainClaim)
	return s, ok
}

// PersistUserCtx injects the user/chain claims
// into a given context.Context.
//
// `chain` or `user` can be nil if only one is required.
// Nil parameters will not overwrite existing values.
func PersistUserCtx(ctx context.Context, chain *ChainClaim, user *UserClaim) context.Context {
	log := logr.FromContextOrDiscard(ctx)
	log.V(2).Info("persisting user information in context", "Chain", chain != nil, "User", user != nil)
	if chain != nil {
		ctx = context.WithValue(ctx, ChainContextKey, chain)
	}
	if user != nil {
		ctx = context.WithValue(ctx, UserContextKey, user)
	}
	return ctx
}
