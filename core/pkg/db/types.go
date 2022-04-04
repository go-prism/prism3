package db

import (
	"gorm.io/gorm"
)

const (
	TransportProfileDefault = "5d78f7b5-f936-48c0-9a17-bb904b4ec643"
	SuperUserDefault        = "2b379256-684c-4ab8-9ef5-faa6406f4c46"
	GoRemote                = "ab093fab-70be-4275-be62-053a729db552"
	GoRefraction            = "ea873bb3-ed79-42ca-948e-5e335b302c95"
)

type Database struct {
	db  *gorm.DB
	dsn string
}
