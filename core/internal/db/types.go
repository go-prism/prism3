package db

import (
	"gorm.io/gorm"
)

const (
	TransportProfileDefault = "5d78f7b5-f936-48c0-9a17-bb904b4ec643"
	SuperUserDefault        = "2b379256-684c-4ab8-9ef5-faa6406f4c46"
)

type Database struct {
	db  *gorm.DB
	dsn string
}
