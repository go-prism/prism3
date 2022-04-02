package permissions

import (
	"github.com/euroteltr/rbac"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
)

type Manager struct {
	r     *rbac.RBAC
	repos *repo.Repos
}
