package helmapi

import "helm.sh/helm/v3/pkg/chart"

func (v *ChartVersion) AsMetadata() *chart.Metadata {
	return &chart.Metadata{
		Name:         v.Name,
		Home:         v.Home,
		Sources:      v.Sources,
		Version:      v.Version,
		Description:  v.Description,
		Keywords:     v.Keywords,
		Maintainers:  v.Maintainers,
		Icon:         v.Icon,
		APIVersion:   v.APIVersion,
		Condition:    v.Condition,
		Tags:         v.Tags,
		AppVersion:   v.AppVersion,
		Deprecated:   v.Deprecated,
		Annotations:  v.Annotations,
		KubeVersion:  v.KubeVersion,
		Dependencies: v.Dependencies,
		Type:         v.Type,
	}
}
