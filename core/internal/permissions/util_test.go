package permissions

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestUserEquals(t *testing.T) {
	var cases = []struct {
		name string
		a    string
		b    string
		ok   bool
	}{
		{
			"identical",
			"CN=Test Issuer/CN=Test User",
			"CN=Test Issuer/CN=Test User",
			true,
		},
		{
			"identical with whitespace",
			"CN=Test Issuer/ CN=Test User ",
			"CN=Test Issuer /CN=Test User",
			true,
		},
		{
			"different order",
			"CN=Test Issuer/CN=Test User,OU=Foo",
			"CN=Test Issuer/OU=Foo,CN=Test User",
			true,
		},
		{
			"invalid",
			"CN=Test Issuer",
			"CN=Test Issuer",
			false,
		},
		{
			"partial",
			"CN=Test Issuer/CN=Test User,OU=Foo",
			"CN=Test Issuer/CN=Test User",
			false,
		},
	}
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			ok := UserEquals(tt.a, tt.b)
			assert.EqualValues(t, tt.ok, ok)
		})
	}
}
