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

package passport

import (
	"context"
	"crypto"
	"crypto/ed25519"
	"encoding/hex"
	"github.com/djcass44/go-utils/utilities/cryptoutils"
	"github.com/go-logr/logr"
	"golang.org/x/crypto/sha3"
	"io/ioutil"
)

type KeyProvider struct {
	publicKey  ed25519.PublicKey
	privateKey ed25519.PrivateKey
	log        logr.Logger
}

// NewFileKeyProvider reads keys from a given filesystem path
func NewFileKeyProvider(ctx context.Context, path string) (*KeyProvider, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", path)
	kp := new(KeyProvider)
	log.Info("reading existing key")
	// read key from file
	data, err := ioutil.ReadFile(path)
	if err != nil {
		log.Error(err, "failed to read key file")
		return nil, err
	}
	// parse the keys
	priv, err := cryptoutils.ParseED25519PrivateKey(log, data)
	if err != nil {
		log.Error(err, "failed to parse private key")
		return nil, err
	}
	kp.privateKey = *priv
	kp.publicKey = priv.Public().(ed25519.PublicKey)
	kp.log = log
	log.Info("successfully setup key provider")

	return kp, nil
}

// NewKeyProvider creates keys and holds them in-memory
func NewKeyProvider(ctx context.Context) (*KeyProvider, error) {
	kp := new(KeyProvider)
	log := logr.FromContextOrDiscard(ctx)
	// generate keys
	log.Info("generating new key provider and keys...")
	// generate key using crypto/rand.Reader
	pubKey, privKey, err := ed25519.GenerateKey(nil)
	if err != nil {
		log.Error(err, "failed to generate keypair")
		return nil, err
	}
	kp.publicKey = pubKey
	kp.privateKey = privKey
	kp.log = log
	log.Info("successfully setup key provider")

	return kp, nil
}

// Sign signs the given message with priv.
// Ed25519 performs two passes over messages to be signed and therefore cannot handle pre-hashed messages.
// Thus opts.HashFunc() must return zero to indicate the message hasn't been hashed. This can be achieved by passing crypto.Hash(0) as the value for opts.
func (kp *KeyProvider) Sign(message []byte) ([]byte, error) {
	return kp.privateKey.Sign(nil, message, crypto.Hash(0))
}

// GetPublicKey returns the stored public key
func (kp *KeyProvider) GetPublicKey() *ed25519.PublicKey {
	return &kp.publicKey
}

// GetPublicKeyHash returns the hash value of the stored public key
func (kp *KeyProvider) GetPublicKeyHash() string {
	log := kp.log
	val, err := kp.ToString()
	if err != nil {
		log.Error(err, "failed to generate pubKey hash (key couldn't be retrieved)")
		return ""
	}
	// create a new generator each time
	h := sha3.New256()
	h.Write([]byte(val))
	// encode as hex
	hash := hex.EncodeToString(h.Sum(nil))

	return hash
}

// ToString returns the stored public key as a string
func (kp *KeyProvider) ToString() (string, error) {
	return cryptoutils.MarshalED25519PublicKey(kp.log, &kp.publicKey)
}
