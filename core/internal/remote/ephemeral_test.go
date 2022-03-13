package remote

import (
	"context"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestEphemeralRemote_Exists(t *testing.T) {
	rem := NewEphemeralRemote("https://mirror.aarnet.edu.au/pub/alpine")
	uri, err := rem.Exists(context.TODO(), "v3.14/main/x86_64/APKINDEX.tar.gz")
	assert.NoError(t, err)
	assert.EqualValues(t, "https://mirror.aarnet.edu.au/pub/alpine/v3.14/main/x86_64/APKINDEX.tar.gz", uri)
}
