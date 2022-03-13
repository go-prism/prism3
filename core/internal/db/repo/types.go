package repo

import "gorm.io/gorm"

type RemoteRepo struct {
	db *gorm.DB
}

type RefractRepo struct {
	db *gorm.DB
}

type Repos struct {
	RemoteRepo  *RemoteRepo
	RefractRepo *RefractRepo
}
