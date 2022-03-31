package helmapi

import (
	"errors"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"helm.sh/helm/v3/pkg/chart"
)

var ErrNoIndexFound = errors.New("no index.yaml could be found in any remote")

type Index struct {
	publicURL string
	repos     *repo.Repos
}

type ChartVersion struct {
	URLs   []string `yaml:"urls"`
	Digest string   `yaml:"digest,omitempty"`

	// The name of the chart. Required.
	Name string `yaml:"name,omitempty"`
	// The URL to a relevant project page, git repo, or contact person
	Home string `yaml:"home,omitempty"`
	// Source is the URL to the source code of this chart
	Sources []string `yaml:"sources,omitempty"`
	// A SemVer 2 conformant version string of the chart. Required.
	Version string `yaml:"version,omitempty"`
	// A one-sentence description of the chart
	Description string `yaml:"description,omitempty"`
	// A list of string keywords
	Keywords []string `yaml:"keywords,omitempty"`
	// A list of name and URL/email address combinations for the maintainer(s)
	Maintainers []*chart.Maintainer `yaml:"maintainers,omitempty"`
	// The URL to an icon file.
	Icon string `yaml:"icon,omitempty"`
	// The API Version of this chart. Required.
	APIVersion string `yaml:"apiVersion,omitempty"`
	// The condition to check to enable chart
	Condition string `yaml:"condition,omitempty"`
	// The tags to check to enable chart
	Tags string `yaml:"tags,omitempty"`
	// The version of the application enclosed inside of this chart.
	AppVersion string `yaml:"appVersion,omitempty"`
	// Whether or not this chart is deprecated
	Deprecated bool `yaml:"deprecated,omitempty"`
	// Annotations are additional mappings uninterpreted by Helm,
	// made available for inspection by other applications.
	Annotations map[string]string `yaml:"annotations,omitempty"`
	// KubeVersion is a SemVer constraint specifying the version of Kubernetes required.
	KubeVersion string `yaml:"kubeVersion,omitempty"`
	// Dependencies are a list of dependencies for a chart.
	Dependencies []*chart.Dependency `yaml:"dependencies,omitempty"`
	// Specifies the chart type: application or library
	Type string `yaml:"type,omitempty"`
}

type IndexFile struct {
	Entries map[string][]*ChartVersion `yaml:"entries"`
}
