package partition

import (
	_ "embed"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGitLabPartition_getAPIAddr(t *testing.T) {
	var cases = []struct {
		in  string
		out string
		ok  bool
	}{
		{
			"https://gitlab.example.com/api/v4/projects/1/packages/maven",
			"https://gitlab.example.com/api/v4/job",
			true,
		},
		{
			"https://gitlab.example.com/api/v4/groups/1/-/packages/maven",
			"https://gitlab.example.com/api/v4/job",
			true,
		},
		{
			"https://gitlab.example.com/api/v4/packages/maven",
			"https://gitlab.example.com/api/v4/job",
			true,
		},
		{
			"https://repo1.maven.org/maven2",
			"",
			false,
		},
		{
			"/api/v4/packages/maven",
			"",
			false,
		},
	}
	gm := &GitLabPartition{}
	for _, tt := range cases {
		t.Run(tt.in, func(t *testing.T) {
			out, ok := gm.getAPIAddr(tt.in)
			assert.EqualValues(t, tt.out, out)
			assert.EqualValues(t, tt.ok, ok)
		})
	}
}
