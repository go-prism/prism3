package db

import (
	"gorm.io/gorm"
)

type Database struct {
	db  *gorm.DB
	dsn string
}
