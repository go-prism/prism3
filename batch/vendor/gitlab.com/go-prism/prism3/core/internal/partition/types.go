package partition

import (
	"context"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"net/http"
)

type Partition interface {
	Apply(ctx context.Context, remote RemoteLike, key, value string) (string, bool)
}

type RemoteLike interface {
	Do(ctx context.Context, method, target string, opt schemas.RequestOptions) (*http.Response, error)
	String() string
}

type gitLabJobResponse struct {
	User struct {
		ID int `json:"id"`
	} `json:"user"`
}
