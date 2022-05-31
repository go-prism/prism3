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

package storage

import (
	"bytes"
	"context"
	"errors"
	"io"
	"io/ioutil"
)

type NoOp struct {
	Data map[string][]byte
}

func NewNoOp() *NoOp {
	return &NoOp{
		Data: map[string][]byte{},
	}
}

func (n *NoOp) Get(_ context.Context, path string) (io.Reader, int64, error) {
	val, ok := n.Data[path]
	if !ok {
		return nil, 0, errors.New("not found")
	}
	return bytes.NewReader(val), int64(len(val)), nil
}

func (n *NoOp) Put(_ context.Context, path string, r io.Reader) error {
	data, err := ioutil.ReadAll(r)
	if err != nil {
		return err
	}
	n.Data[path] = data
	return nil
}

func (n *NoOp) Head(_ context.Context, path string) (bool, error) {
	_, ok := n.Data[path]
	return ok, nil
}

func (n *NoOp) Size(context.Context, string) (*BucketSize, error) {
	count := len(n.Data)
	size := int64(0)
	for _, d := range n.Data {
		size += int64(len(d))
	}
	return &BucketSize{
		Count: int64(count),
		Bytes: size,
	}, nil
}
