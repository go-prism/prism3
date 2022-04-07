package schemas

import "gorm.io/gorm"

type HelmPackage struct {
	gorm.Model
	Filename string `gorm:"index;unique"`
	URL      string

	Name        string
	Version     string
	Digest      string
	Icon        string
	APIVersion  string
	AppVersion  string
	KubeVersion string
	Type        string

	RemoteID string `gorm:"index"`
}
