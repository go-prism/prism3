package permissions

import (
	"context"
	"fmt"
	"github.com/euroteltr/rbac"
	"github.com/go-logr/logr"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
)

func NewManager(repos *repo.Repos) *Manager {
	return &Manager{
		r:     rbac.New(rbac.NewConsoleLogger()),
		repos: repos,
	}
}

func (m *Manager) Load(ctx context.Context) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "rbac_load")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	// register roles
	super := MustRegisterRole(m.r, model.RoleSuper, "Super user")
	//_ = MustRegisterRole(m.r, model.RolePower, "Power user")
	names, err := m.repos.RefractRepo.ListNames(ctx)
	if err != nil {
		return err
	}
	for _, n := range names {
		_ = MustRegisterPermission(m.r, m.resourceName(n.Resource, n.Name), n.Name)
	}
	log.V(1).Info("generated permissions", "Count", len(names))

	bindings, err := m.repos.RBACRepo.List(ctx)
	if err != nil {
		return err
	}
	for _, b := range bindings {
		log.V(2).Info("registering Role", "RoleBinding", b)
		role := MustRegisterRole(m.r, NormalUser(b.Subject), "User role")
		if b.Role == model.RoleSuper {
			_ = role.AddParent(super)
		} else if b.Role == model.RolePower {
			perm := m.r.GetPermission(b.Resource)
			if perm == nil {
				log.Info("failed to locate permission", "Permission", b.Resource)
				continue
			}
			_ = m.r.Permit(role.ID, perm, rbac.CRUD)
		}
	}
	return nil
}

func (m *Manager) CanI(ctx context.Context, resource repo.Resource, resourceID string, verb rbac.Action) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "rbac_canI")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Resource", resource, "ID", resourceID, "Verb", verb)
	user, ok := client.GetContextUser(ctx)
	if !ok {
		log.V(1).Info("skipping CanI check due to missing user")
		return errs.ErrUnauthorised
	}
	username := NormalUser(user.AsUsername())
	log.V(1).Info("normalised user", "User", username)
	log.V(1).Info("checking user access", "User", username)
	ok = m.r.IsGrantInheritedStr(username, m.resourceName(resource, resourceID), verb)
	if !ok {
		log.Info("blocking user access due to missing RBAC rule")
		return errs.ErrForbidden
	}
	return nil
}

func (m *Manager) AmI(ctx context.Context, role model.Role) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "rbac_amI")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Role", role.String())
	user, ok := client.GetContextUser(ctx)
	if !ok {
		log.V(1).Info("skipping AmI check due to missing user")
		return errs.ErrUnauthorised
	}
	username := NormalUser(user.AsUsername())
	log.V(1).Info("normalised user", "User", username)
	log.V(1).Info("checking user access to role", "User", username)
	userRole := m.r.GetRole(username)
	if userRole == nil {
		log.Info("failed to locate any role for user")
		return errs.ErrForbidden
	}
	ok = userRole.HasAncestor(string(role))
	if !ok {
		log.Info("unable to find role in any ancestor")
		return errs.ErrForbidden
	}
	return nil
}

func (*Manager) resourceName(r repo.Resource, id string) string {
	return fmt.Sprintf("%s::%s", r, id)
}

func MustRegisterRole[T ~string](r *rbac.RBAC, roleID, description T) *rbac.Role {
	role, err := r.RegisterRole(string(roleID), string(description))
	if err != nil {
		return r.GetRole(string(roleID))
	}
	return role
}

func MustRegisterPermission[T ~string](r *rbac.RBAC, permID, description T) *rbac.Permission {
	perm, err := r.RegisterPermission(string(permID), string(description), rbac.CRUD)
	if err != nil {
		return r.GetPermission(string(permID))
	}
	return perm
}
