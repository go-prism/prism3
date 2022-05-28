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

package permissions

import (
	"context"
	"fmt"
	"github.com/go-logr/logr"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
)

func NewManager(ctx context.Context, r rbac.AuthorityClient, superuser string) (*Manager, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("creating initial superuser", "Username", superuser)
	if _, err := r.AddGlobalRole(ctx, &rbac.AddGlobalRoleRequest{Subject: NormalUser(superuser), Role: string(model.RoleSuper)}); err != nil {
		log.Error(err, "failed to create initial superuser")
		return nil, err
	}
	log.V(1).Info("successfully created initial superuser")
	return &Manager{
		RBAC: r,
	}, nil
}

func (m *Manager) CanI(ctx context.Context, resource repo.Resource, resourceID string, verb rbac.Verb) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "rbac_canI")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Resource", resource, "ID", resourceID, "Verb", verb)
	user, ok := client.GetContextUser(ctx)
	if !ok {
		log.V(1).Info("skipping CanI check due to missing user")
		return errs.ErrUnauthorised
	}
	username := NormalUser(user.AsUsername())
	log = log.WithValues("User", username)
	log.V(1).Info("checking user access")
	resp, err := m.RBAC.Can(ctx, &rbac.AccessRequest{
		Subject:  username,
		Resource: m.resourceName(resource, resourceID),
		Action:   verb,
	})
	if err != nil {
		log.Error(err, "failed to check user access with the rbac sidecar")
		return errs.ErrForbidden
	}
	log.V(1).Info("successfully completed RBAC check", "Member", resp.GetOk())
	ok = resp.GetOk()
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
	resp, err := m.RBAC.Can(ctx, &rbac.AccessRequest{
		Subject:  username,
		Resource: string(role),
	})
	if err != nil {
		log.Error(err, "failed to check role membership with the rbac sidecar")
		return errs.ErrForbidden
	}
	ok = resp.GetOk()
	if !ok {
		log.Info("unable to find role in any ancestor")
		return errs.ErrForbidden
	}
	return nil
}

func (*Manager) resourceName(r repo.Resource, id string) string {
	return fmt.Sprintf("%s::%s", r, id)
}
