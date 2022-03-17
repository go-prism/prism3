package repo

import "gorm.io/gorm"

type RemoteRepo struct {
	db *gorm.DB
}

type RefractRepo struct {
	db *gorm.DB
}

type TransportRepo struct {
	db *gorm.DB
}

type ArtifactRepo struct {
	db *gorm.DB
}

type Repos struct {
	RemoteRepo    *RemoteRepo
	RefractRepo   *RefractRepo
	TransportRepo *TransportRepo
	ArtifactRepo  *ArtifactRepo
}
