package permissions

import (
	"errors"
	"github.com/euroteltr/rbac"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
)

var (
	ErrUnauthorised = errors.New("unauthorised")
	ErrForbidden    = errors.New("forbidden")
)

type Manager struct {
	r     *rbac.RBAC
	repos *repo.Repos
}
