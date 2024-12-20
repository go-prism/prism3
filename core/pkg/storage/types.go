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
	"context"
	"io"
)

type BucketSize struct {
	Count int64
	Bytes int64
}

type Reader interface {
	Get(ctx context.Context, path string) (io.Reader, int64, error)
	Put(ctx context.Context, path string, r io.Reader) error
	Head(ctx context.Context, path string) (bool, error)
	Size(ctx context.Context, path string) (*BucketSize, error)
}
