package db

import (
	"gorm.io/gorm"
)

const (
	TransportProfileDefault = "5d78f7b5-f936-48c0-9a17-bb904b4ec643"
)

type Database struct {
	db  *gorm.DB
	dsn string
}
