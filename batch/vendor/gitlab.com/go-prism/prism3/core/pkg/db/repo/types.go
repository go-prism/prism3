package repo

import "gorm.io/gorm"

type Resource string

const (
	ResourceRefraction Resource = "refraction"
	ResourceRemote     Resource = "remote"
	ResourceTransport  Resource = "transport"
)

type ResourceName struct {
	Name     string
	Resource Resource
}

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

type NPMPackageRepo struct {
	db *gorm.DB
}

type PyPackageRepo struct {
	db *gorm.DB
}

type HelmPackageRepo struct {
	db *gorm.DB
}

type RBACRepo struct {
	db *gorm.DB
}

type UserRepo struct {
	db *gorm.DB
}

type Repos struct {
	RemoteRepo      *RemoteRepo
	RefractRepo     *RefractRepo
	TransportRepo   *TransportRepo
	ArtifactRepo    *ArtifactRepo
	NPMPackageRepo  *NPMPackageRepo
	PyPackageRepo   *PyPackageRepo
	HelmPackageRepo *HelmPackageRepo
	RBACRepo        *RBACRepo
	UserRepo        *UserRepo
}
