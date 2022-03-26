package schemas

import "gorm.io/gorm"

type PyPackage struct {
	gorm.Model
	Name           string `gorm:"index"`
	Filename       string `gorm:"index"`
	URL            string
	Signed         bool
	RequiresPython string
}
