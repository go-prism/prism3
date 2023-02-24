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

package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"runtime"
	"runtime/debug"
	"strings"

	"github.com/go-logr/logr"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/permissions"
	"gitlab.com/go-prism/prism3/core/pkg/db/notify"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"google.golang.org/protobuf/types/known/emptypb"
)

func (r *mutationResolver) CreateRemote(ctx context.Context, input model.NewRemote) (*model.Remote, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	// make sure that the creator has full
	// access to the remote
	if err := r.createRoleBinding(ctx, fmt.Sprintf("%s::%s", repo.ResourceRemote, input.Name), rbac.Verb_SUDO); err != nil {
		return nil, err
	}
	rem, err := r.repos.RemoteRepo.CreateRemote(ctx, &input)
	if err != nil {
		return nil, err
	}
	task, err := tasks.NewTask[tasks.IndexRemotePayload](ctx, tasks.TypeIndexRemote, &tasks.IndexRemotePayload{RemoteID: rem.ID})
	if err != nil {
		return nil, err
	}
	_, _ = r.client.Enqueue(task)
	return rem, err
}

func (r *mutationResolver) PatchRemote(ctx context.Context, id string, input model.PatchRemote) (*model.Remote, error) {
	if err := r.authz.CanI(ctx, repo.ResourceRemote, id, rbac.Verb_UPDATE); err != nil {
		return nil, err
	}
	return r.repos.RemoteRepo.PatchRemote(ctx, id, &input)
}

func (r *mutationResolver) DeleteRemote(ctx context.Context, id string) (bool, error) {
	if err := r.authz.CanI(ctx, repo.ResourceRemote, id, rbac.Verb_DELETE); err != nil {
		return false, err
	}
	if err := r.repos.RemoteRepo.DeleteRemote(ctx, id); err != nil {
		return false, err
	}
	return true, nil
}

func (r *mutationResolver) CreateRefraction(ctx context.Context, input model.NewRefract) (*model.Refraction, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	// make sure that the creator has full
	// access to the remote
	if err := r.createRoleBinding(ctx, fmt.Sprintf("%s::%s", repo.ResourceRefraction, input.Name), rbac.Verb_SUDO); err != nil {
		return nil, err
	}
	return r.repos.RefractRepo.CreateRefraction(ctx, &input)
}

func (r *mutationResolver) PatchRefraction(ctx context.Context, id string, input model.PatchRefract) (*model.Refraction, error) {
	if err := r.authz.CanI(ctx, repo.ResourceRefraction, id, rbac.Verb_UPDATE); err != nil {
		return nil, err
	}
	return r.repos.RefractRepo.PatchRefraction(ctx, id, &input)
}

func (r *mutationResolver) DeleteRefraction(ctx context.Context, id string) (bool, error) {
	if err := r.authz.CanI(ctx, repo.ResourceRefraction, id, rbac.Verb_DELETE); err != nil {
		return false, err
	}
	if err := r.repos.RefractRepo.DeleteRefraction(ctx, id); err != nil {
		return false, err
	}
	return true, nil
}

func (r *mutationResolver) CreateRoleBinding(ctx context.Context, input model.NewRoleBinding) (*model.RoleBinding, error) {
	user, _ := client.GetContextUser(ctx)
	subject := permissions.NormalUser(user.AsUsername())
	if err := r.createRoleBinding(ctx, input.Resource, rbac.Verb(rbac.Verb_value[input.Verb.String()])); err != nil {
		return nil, err
	}
	return &model.RoleBinding{
		Subject:  subject,
		Resource: input.Resource,
		Verb:     input.Verb,
	}, nil
}

func (r *mutationResolver) CreateTransportProfile(ctx context.Context, input model.NewTransportProfile) (*model.TransportSecurity, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.TransportRepo.CreateTransport(ctx, &input)
}

func (r *mutationResolver) SetPreference(ctx context.Context, key string, value string) (bool, error) {
	return true, r.repos.UserRepo.SetPreference(ctx, key, value)
}

func (r *queryResolver) ListRemotes(ctx context.Context, arch string) ([]*model.Remote, error) {
	return r.repos.RemoteRepo.ListRemotes(ctx, model.Archetype(arch), r.authz.AmI(ctx, model.RoleSuper) == nil)
}

func (r *queryResolver) GetRemote(ctx context.Context, id string) (*model.Remote, error) {
	return r.repos.RemoteRepo.GetRemote(ctx, id, r.authz.AmI(ctx, model.RoleSuper) == nil)
}

func (r *queryResolver) ListRefractions(ctx context.Context) ([]*model.Refraction, error) {
	return r.repos.RefractRepo.ListRefractions(ctx)
}

func (r *queryResolver) GetRefraction(ctx context.Context, id string) (*model.Refraction, error) {
	return r.repos.RefractRepo.GetRefraction(ctx, id)
}

func (r *queryResolver) ListTransports(ctx context.Context) ([]*model.TransportSecurity, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.TransportRepo.ListTransports(ctx)
}

func (r *queryResolver) ListArtifacts(ctx context.Context, remote string) ([]*model.Artifact, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "graph_query_listArtifacts")
	defer span.End()
	if _, ok := client.GetContextUser(ctx); !ok {
		return nil, errs.ErrUnauthorised
	}
	return r.repos.ArtifactRepo.ListArtifacts(ctx, []string{remote})
}

func (r *queryResolver) ListCombinedArtifacts(ctx context.Context, refract string) ([]*model.Artifact, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "graph_query_listCombinedArtifacts")
	defer span.End()
	if _, ok := client.GetContextUser(ctx); !ok {
		return nil, errs.ErrUnauthorised
	}
	// collect a list of remotes
	ref, err := r.repos.RefractRepo.GetRefraction(ctx, refract)
	if err != nil {
		return nil, err
	}
	remotes := make([]string, len(ref.Remotes))
	for i := range remotes {
		remotes[i] = ref.Remotes[i].ID
	}
	return r.repos.ArtifactRepo.ListArtifacts(ctx, remotes)
}

func (r *queryResolver) GetOverview(ctx context.Context) (*model.Overview, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "graph_query_getOverview")
	defer span.End()
	_, ok := client.GetContextUser(ctx)
	log := logr.FromContextOrDiscard(ctx)
	remotes, _ := r.repos.RemoteRepo.Count(ctx)
	refracts, _ := r.repos.RefractRepo.Count(ctx)
	artifacts, _ := r.repos.ArtifactRepo.Count(ctx)
	downloads, _ := r.repos.ArtifactRepo.Downloads(ctx)
	packagesPyPi, _ := r.repos.PyPackageRepo.Count(ctx)
	packagesNPM, _ := r.repos.NPMPackageRepo.Count(ctx)
	packagesHelm, _ := r.repos.HelmPackageRepo.Count(ctx)
	// zero certain fields unless
	// a user is logged in
	var users, ut, storeSize int64
	if ok {
		users, _ = r.repos.UserRepo.Count(ctx)
		ut = uptime.UnixMilli()
		store, err := r.storeSizeCache.Get("")
		if err != nil {
			log.Error(err, "failed to retrieved storage usage statistics")
			return nil, err
		}
		storeSize = store.(*storage.BucketSize).Bytes
	}
	// get debug build information
	var buildInfo string
	build, ok := debug.ReadBuildInfo()
	if ok {
		buildInfo = build.Main.Version
	}
	var m runtime.MemStats
	// only reveal system information to administrators
	if err := r.authz.AmI(ctx, model.RoleSuper); err == nil {
		log.V(1).Info("reading runtime statistics")
		runtime.ReadMemStats(&m)
		log.V(2).Info("successfully read memory statistics", "Statistics", m)
	}

	return &model.Overview{
		Remotes:           remotes,
		Refractions:       refracts,
		Artifacts:         artifacts,
		Storage:           storeSize,
		Downloads:         downloads,
		Uptime:            ut,
		Version:           buildInfo,
		Users:             users,
		PackagesPypi:      packagesPyPi,
		PackagesNpm:       packagesNPM,
		PackagesHelm:      packagesHelm,
		SystemMemory:      int64(m.Alloc),
		SystemMemoryOs:    int64(m.Sys),
		SystemMemoryTotal: int64(m.TotalAlloc),
	}, nil
}

func (r *queryResolver) GetRemoteOverview(ctx context.Context, id string) (*model.RemoteOverview, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "graph_query_getRemoteOverview")
	defer span.End()
	count, err := r.repos.ArtifactRepo.CountArtifactsByRemote(ctx, id)
	if err != nil {
		return nil, err
	}
	return &model.RemoteOverview{
		Artifacts: count,
		Storage:   0,
	}, nil
}

func (r *queryResolver) GetRoleBindings(ctx context.Context, user string) ([]*model.RoleBinding, error) {
	log := logr.FromContextOrDiscard(ctx)
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	var bindings *rbac.ListResponse
	var err error
	if user == "" {
		log.V(1).Info("listing role bindings")
		bindings, err = r.authz.RBAC.List(ctx, &emptypb.Empty{})
	} else {
		log.V(1).Info("listing role bindings by subject", "Subject", user)
		bindings, err = r.authz.RBAC.ListBySub(ctx, &rbac.ListBySubRequest{Subject: user})
	}
	if err != nil {
		log.Error(err, "failed to list role bindings")
		return nil, err
	}
	items := make([]*model.RoleBinding, len(bindings.Results))
	for i, b := range bindings.Results {
		items[i] = &model.RoleBinding{
			Subject:  b.GetSubject(),
			Resource: b.GetResource(),
			Verb:     model.Verb(b.GetAction().String()),
		}
	}
	return items, nil
}

func (r *queryResolver) GetUsers(ctx context.Context, resource string) ([]*model.RoleBinding, error) {
	res, id, _ := strings.Cut(resource, "::")
	log := logr.FromContextOrDiscard(ctx)
	// allow owners of resources to view
	// roles for this resource
	if err := r.authz.CanI(ctx, repo.Resource(res), id, rbac.Verb_SUDO); err != nil {
		return nil, err
	}
	bindings, err := r.authz.RBAC.ListByRole(ctx, &rbac.ListByRoleRequest{Role: resource})
	if err != nil {
		log.Error(err, "failed to list role bindings by subject")
		return nil, err
	}
	items := make([]*model.RoleBinding, len(bindings.Results))
	for i, b := range bindings.Results {
		items[i] = &model.RoleBinding{
			Subject:  b.GetSubject(),
			Resource: b.GetResource(),
			Verb:     model.Verb(b.GetAction().String()),
		}
	}
	return items, nil
}

func (r *queryResolver) GetBandwidthUsage(ctx context.Context, resource string, date string) ([]*model.BandwidthUsage, error) {
	res, id, _ := strings.Cut(resource, "::")
	if err := r.authz.CanI(ctx, repo.Resource(res), id, rbac.Verb_SUDO); err != nil {
		return nil, err
	}
	return r.repos.BandwidthRepo.Get(ctx, resource, date)
}

func (r *queryResolver) GetTotalBandwidthUsage(ctx context.Context, resource string) ([]*model.BandwidthUsage, error) {
	res, id, _ := strings.Cut(resource, "::")
	if err := r.authz.CanI(ctx, repo.Resource(res), id, rbac.Verb_SUDO); err != nil {
		return nil, err
	}
	return r.repos.BandwidthRepo.GetTotal(ctx, resource)
}

func (r *queryResolver) ListUsers(ctx context.Context) ([]*model.StoredUser, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.UserRepo.List(ctx)
}

func (r *queryResolver) GetCurrentUser(ctx context.Context) (*model.StoredUser, error) {
	user, ok := client.GetContextUser(ctx)
	if !ok {
		return nil, errs.ErrUnauthorised
	}
	// create or fetch the current user
	u, err := r.repos.UserRepo.CreateCtx(ctx)
	if err != nil {
		return &model.StoredUser{
			ID:  user.AsUsername(),
			Sub: user.Sub,
			Iss: user.Iss,
		}, nil
	}
	return u, nil
}

func (r *queryResolver) UserCan(ctx context.Context, resource string, action model.Verb) (bool, error) {
	res, id, _ := strings.Cut(resource, "::")
	if err := r.authz.CanI(ctx, repo.Resource(res), id, rbac.Verb(rbac.Verb_value[action.String()])); err != nil {
		return false, nil
	}
	return true, nil
}

func (r *queryResolver) UserHas(ctx context.Context, role model.Role) (bool, error) {
	if err := r.authz.AmI(ctx, role); err != nil {
		return false, nil
	}
	return true, nil
}

func (r *subscriptionResolver) GetCurrentUser(ctx context.Context) (<-chan *model.StoredUser, error) {
	user, ok := client.GetContextUser(ctx)
	if !ok {
		return nil, errs.ErrUnauthorised
	}
	events := make(chan *model.StoredUser, 1)
	r.stream(ctx, []string{schemas.TableNameStoredUsers}, func(msg *notify.Message) {
		if msg != nil && msg.ID != user.AsUsername() {
			return
		}
		// create or fetch the current user
		u, err := r.repos.UserRepo.CreateCtx(ctx)
		if err != nil {
			events <- &model.StoredUser{
				ID:  user.AsUsername(),
				Sub: user.Sub,
				Iss: user.Iss,
			}
			return
		}
		events <- u
	})
	return events, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
