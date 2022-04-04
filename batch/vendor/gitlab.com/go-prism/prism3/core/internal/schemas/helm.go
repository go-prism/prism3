package schemas

import "gorm.io/gorm"

type HelmPackage struct {
	gorm.Model
	Filename string `gorm:"index;unique"`
	URL      string
}
