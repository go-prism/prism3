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
	"crypto/ed25519"
	"encoding/base64"
	"fmt"
	"github.com/cenkalti/backoff/v4"
	"github.com/djcass44/go-tracer/tracer"
	"github.com/djcass44/go-utils/pkg/cryptoutils"
	"github.com/levigross/grequests"
	log "github.com/sirupsen/logrus"
	"gitlab.com/av1o/cap10/pkg/api"
)

type Verifier struct {
	BaseVerifier
	url           string
	publicKey     *ed25519.PublicKey
	publicKeyHash string
}

// NewVerifier creates a Verifier and attempts to load the CAP10 public key
//goland:noinspection GoUnusedExportedFunction
func NewVerifier(url string) (*Verifier, error) {
	v := new(Verifier)
	v.url = url

	// start trying to get the public key from cap10
	err := backoff.Retry(v.waitForPublicKey, backoff.NewExponentialBackOff())
	if err != nil {
		log.WithError(err).Error("failed to load public key within back-off period")
		return nil, err
	}
	return v, nil
}

// waitForPublicKey tries to load the public key
func (v *Verifier) waitForPublicKey() error {
	// get the public key
	key, keyHash, err := v.getPublicKey()
	if err == nil {
		log.Info("successfully loaded CAP10 public key")
		v.publicKey = key
		v.publicKeyHash = keyHash
		return nil
	}
	log.WithError(err).Error("failed to load CAP10 public key, backing off")
	return err
}

func (v *Verifier) getPublicKey() (*ed25519.PublicKey, string, error) {
	log.WithField("url", v.url).Info("loading public key from cap10")
	// execute the request to load public key data
	resp, err := grequests.Get(fmt.Sprintf("%s/.well-known/cap10.json", v.url), nil)
	if err != nil {
		log.WithError(err).Error("failed to execute request")
		return nil, "", err
	}
	log.Debugf("got %d code from cap10 key retrieval", resp.StatusCode)
	// check for 200
	if !resp.Ok {
		return nil, "", fmt.Errorf("http request failed with code %d", resp.StatusCode)
	}
	// convert the json into something we understand
	var dto api.PassportDTO
	err = resp.JSON(&dto)
	if err != nil {
		log.WithError(err).Error("failed to read json response")
		return nil, "", err
	}
	key, err := cryptoutils.ParseED25519PublicKey([]byte(dto.PublicKey))
	return key, dto.PublicKeyHash, err
}

// IsValid checks whether sig is a signed version of msg
func (v *Verifier) IsValid(ctx context.Context, msg, sig, sigHash string) bool {
	id := tracer.GetContextId(ctx)
	if v.publicKey == nil {
		log.WithField("id", id).Errorf("cap10 verifier has no public key, authenticity cannot be verified")
		return false
	}
	// check if our keyhash matches what we expect
	if v.publicKeyHash != sigHash {
		log.WithField("id", id).Warnf("detected sighash mismatch, requesting new key... (expected: '%s', got: '%s')", v.publicKeyHash, sigHash)
		// try to reload our key
		if err := v.waitForPublicKey(); err != nil {
			log.WithError(err).WithField("id", id).Error("failed to reload key, authenticity cannot be verified")
			return false
		}
		// todo check whether we can get stuck in an infinite loop here...
		return v.IsValid(ctx, msg, sig, sigHash)
	}
	log.WithField("id", id).Debugf("detected sighash: %s", sigHash)
	bytes, err := base64.StdEncoding.DecodeString(sig)
	if err != nil {
		log.WithError(err).WithField("id", id).Errorf("failed to decode base64 authenticity token '%s'", sig)
		return false
	}
	return ed25519.Verify(*v.publicKey, []byte(msg), bytes)
}
