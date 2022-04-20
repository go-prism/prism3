package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"runtime"
	"runtime/debug"

	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
)

func (r *mutationResolver) CreateRemote(ctx context.Context, input model.NewRemote) (*model.Remote, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	rem, err := r.repos.RemoteRepo.CreateRemote(ctx, &input)
	if err != nil {
		return nil, err
	}
	task, err := tasks.NewTask[tasks.IndexRemotePayload](tasks.TypeIndexRemote, &tasks.IndexRemotePayload{RemoteID: rem.ID})
	if err != nil {
		return nil, err
	}
	_, _ = r.client.Enqueue(task)
	return rem, err
}

func (r *mutationResolver) DeleteRemote(ctx context.Context, id string) (bool, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return false, err
	}
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateRefraction(ctx context.Context, input model.NewRefract) (*model.Refraction, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.RefractRepo.CreateRefraction(ctx, &input)
}

func (r *mutationResolver) PatchRefraction(ctx context.Context, id string, input model.PatchRefract) (*model.Refraction, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.RefractRepo.PatchRefraction(ctx, id, &input)
}

func (r *mutationResolver) DeleteRefraction(ctx context.Context, id string) (bool, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return false, err
	}
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateRoleBinding(ctx context.Context, input model.NewRoleBinding) (*model.RoleBinding, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	rb, err := r.repos.RBACRepo.Create(ctx, &input)
	if err != nil {
		return nil, err
	}
	// reload in the background
	go func() {
		_ = r.authz.Load(context.TODO())
	}()
	return rb, nil
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
	return r.repos.RemoteRepo.ListRemotes(ctx, model.Archetype(arch))
}

func (r *queryResolver) GetRemote(ctx context.Context, id string) (*model.Remote, error) {
	return r.repos.RemoteRepo.GetRemote(ctx, id)
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
	return r.repos.ArtifactRepo.ListArtifacts(ctx, []string{remote})
}

func (r *queryResolver) ListCombinedArtifacts(ctx context.Context, refract string) ([]*model.Artifact, error) {
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
	store, err := r.storeSizeCache.Get("")
	if err != nil {
		return nil, err
	}
	remotes, _ := r.repos.RemoteRepo.Count(ctx)
	refracts, _ := r.repos.RefractRepo.Count(ctx)
	artifacts, _ := r.repos.ArtifactRepo.Count(ctx)
	downloads, _ := r.repos.ArtifactRepo.Downloads(ctx)
	packagesPyPi, _ := r.repos.PyPackageRepo.Count(ctx)
	packagesNPM, _ := r.repos.NPMPackageRepo.Count(ctx)
	packagesHelm, _ := r.repos.HelmPackageRepo.Count(ctx)
	users, _ := r.repos.UserRepo.Count(ctx)
	// get debug build information
	var buildInfo string
	build, ok := debug.ReadBuildInfo()
	if ok {
		buildInfo = build.Main.Version
	}
	var m runtime.MemStats
	// only reveal system information to administrators
	if err := r.authz.AmI(ctx, model.RoleSuper); err == nil {
		runtime.ReadMemStats(&m)
	}

	return &model.Overview{
		Remotes:           remotes,
		Refractions:       refracts,
		Artifacts:         artifacts,
		Storage:           store.(*storage.BucketSize).Bytes,
		Downloads:         downloads,
		Uptime:            uptime.UnixMilli(),
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
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.RBACRepo.ListForSubject(ctx, user)
}

func (r *queryResolver) GetUsers(ctx context.Context, role model.Role) ([]*model.RoleBinding, error) {
	if err := r.authz.AmI(ctx, model.RoleSuper); err != nil {
		return nil, err
	}
	return r.repos.RBACRepo.ListForRole(ctx, role)
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

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
