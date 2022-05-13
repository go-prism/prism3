package partition

import (
	"context"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNoOpPartition_Apply(t *testing.T) {
	p := new(NoOpPartition)
	val, ok := p.Apply(context.TODO(), nil, "", "test")
	assert.EqualValues(t, "test", val)
	assert.False(t, ok)
}
