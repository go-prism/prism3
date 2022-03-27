package repo

import "gorm.io/gorm"

func NewRepos(db *gorm.DB) *Repos {
	return &Repos{
		RemoteRepo:      NewRemoteRepo(db),
		RefractRepo:     NewRefractRepo(db),
		TransportRepo:   NewTransportRepo(db),
		ArtifactRepo:    NewArtifactRepo(db),
		NPMPackageRepo:  NewNPMRepo(db),
		PyPackageRepo:   NewPyRepo(db),
		HelmPackageRepo: NewHelmRepo(db),
		RBACRepo:        NewRBACRepo(db),
	}
}
