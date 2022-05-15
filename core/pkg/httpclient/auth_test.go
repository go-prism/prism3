package httpclient_test

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"net/http"
	"testing"
)

func TestApplyAuth(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))

	req, err := http.NewRequest(http.MethodHead, "https://example.com", nil)
	require.NoError(t, err)

	httpclient.ApplyAuth(ctx, req, httpclient.AuthOpts{
		Mode:   httpclient.AuthHeader,
		Header: "Private-Token",
		Token:  "hunter2",
	})

	assert.EqualValues(t, "hunter2", req.Header.Get("Private-Token"))
}
