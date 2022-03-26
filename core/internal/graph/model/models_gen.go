// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"

	"gitlab.com/go-prism/prism3/core/internal/db/datatypes"
)

type Artifact struct {
	ID        string              `json:"id" gorm:"primaryKey;type:uuid;not null;default:gen_random_uuid()"`
	CreatedAt int64               `json:"createdAt"`
	UpdatedAt int64               `json:"updatedAt"`
	URI       string              `json:"uri"`
	Downloads int64               `json:"downloads"`
	RemoteID  string              `json:"remoteID" gorm:"index"`
	Slices    datatypes.JSONArray `json:"slices"`
}

type NewRefract struct {
	Name      string    `json:"name"`
	Archetype Archetype `json:"archetype"`
	Remotes   []string  `json:"remotes"`
}

type NewRemote struct {
	Name      string    `json:"name"`
	URI       string    `json:"uri"`
	Archetype Archetype `json:"archetype"`
	Transport string    `json:"transport"`
}

type Overview struct {
	Remotes      int64  `json:"remotes"`
	Refractions  int64  `json:"refractions"`
	Artifacts    int64  `json:"artifacts"`
	Storage      int64  `json:"storage"`
	Downloads    int64  `json:"downloads"`
	Uptime       int64  `json:"uptime"`
	Version      string `json:"version"`
	PackagesPypi int64  `json:"packages_pypi"`
	PackagesNpm  int64  `json:"packages_npm"`
}

type PatchRefract struct {
	Name    string   `json:"name"`
	Remotes []string `json:"remotes"`
}

type Refraction struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;not null;default:gen_random_uuid()"`
	CreatedAt int64     `json:"createdAt"`
	UpdatedAt int64     `json:"updatedAt"`
	Name      string    `json:"name" gorm:"unique"`
	Archetype Archetype `json:"archetype"`
	Remotes   []*Remote `json:"remotes" gorm:"many2many:ref_remotes;"`
}

type Remote struct {
	ID          string             `json:"id" gorm:"primaryKey;type:uuid;not null;default:gen_random_uuid()"`
	CreatedAt   int64              `json:"createdAt"`
	UpdatedAt   int64              `json:"updatedAt"`
	Name        string             `json:"name" gorm:"unique"`
	URI         string             `json:"uri"`
	Archetype   Archetype          `json:"archetype" gorm:"index"`
	Enabled     bool               `json:"enabled" gorm:"index"`
	SecurityID  string             `json:"securityID"`
	Security    *RemoteSecurity    `json:"security"`
	TransportID string             `json:"transportID"`
	Transport   *TransportSecurity `json:"transport"`
}

type RemoteOverview struct {
	Artifacts int64 `json:"artifacts"`
	Storage   int64 `json:"storage"`
}

type RemoteSecurity struct {
	ID          string              `json:"id" gorm:"primaryKey;type:uuid;not null;default:gen_random_uuid()"`
	Allowed     datatypes.JSONArray `json:"allowed"`
	Blocked     datatypes.JSONArray `json:"blocked"`
	AuthHeaders datatypes.JSONArray `json:"authHeaders"`
}

type TransportSecurity struct {
	ID            string `json:"id" gorm:"primaryKey;type:uuid;not null;default:gen_random_uuid()"`
	Name          string `json:"name" gorm:"unique"`
	Ca            string `json:"ca"`
	Cert          string `json:"cert"`
	Key           string `json:"key"`
	SkipTLSVerify bool   `json:"skipTLSVerify"`
	HTTPProxy     string `json:"httpProxy"`
	HTTPSProxy    string `json:"httpsProxy"`
	NoProxy       string `json:"noProxy"`
}

type Archetype string

const (
	ArchetypeGeneric Archetype = "GENERIC"
	ArchetypeMaven   Archetype = "MAVEN"
	ArchetypeGo      Archetype = "GO"
	ArchetypeNpm     Archetype = "NPM"
	ArchetypeAlpine  Archetype = "ALPINE"
	ArchetypeHelm    Archetype = "HELM"
	ArchetypeRust    Archetype = "RUST"
	ArchetypeDebian  Archetype = "DEBIAN"
	ArchetypePip     Archetype = "PIP"
)

var AllArchetype = []Archetype{
	ArchetypeGeneric,
	ArchetypeMaven,
	ArchetypeGo,
	ArchetypeNpm,
	ArchetypeAlpine,
	ArchetypeHelm,
	ArchetypeRust,
	ArchetypeDebian,
	ArchetypePip,
}

func (e Archetype) IsValid() bool {
	switch e {
	case ArchetypeGeneric, ArchetypeMaven, ArchetypeGo, ArchetypeNpm, ArchetypeAlpine, ArchetypeHelm, ArchetypeRust, ArchetypeDebian, ArchetypePip:
		return true
	}
	return false
}

func (e Archetype) String() string {
	return string(e)
}

func (e *Archetype) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Archetype(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Archetype", str)
	}
	return nil
}

func (e Archetype) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
