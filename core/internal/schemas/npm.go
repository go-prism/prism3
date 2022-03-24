package schemas

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type NPMPackage struct {
	gorm.Model
	Name     string `gorm:"uniqueIndex"`
	Document datatypes.JSON
}
