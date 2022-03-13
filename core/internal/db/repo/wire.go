package repo

import "gorm.io/gorm"

func NewRepos(db *gorm.DB) *Repos {
	return &Repos{
		RemoteRepo: NewRemoteRepo(db),
	}
}
