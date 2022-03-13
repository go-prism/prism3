package repo

import "gorm.io/gorm"

type RemoteRepo struct {
	db *gorm.DB
}

type Repos struct {
	RemoteRepo *RemoteRepo
}
