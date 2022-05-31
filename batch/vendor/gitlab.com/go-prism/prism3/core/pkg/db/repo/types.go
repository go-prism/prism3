/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

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

type UserRepo struct {
	db *gorm.DB
}

type BandwidthRepo struct {
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
	UserRepo        *UserRepo
	BandwidthRepo   *BandwidthRepo
}
