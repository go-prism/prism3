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

func (n *NoOp) Get(_ context.Context, path string) (io.Reader, error) {
	val, ok := n.Data[path]
	if !ok {
		return nil, errors.New("not found")
	}
	return bytes.NewReader(val), nil
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
