package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"gitlab.com/go-prism/prism3/core/internal/graph/generated"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
)

func (r *mutationResolver) CreateRemote(ctx context.Context, input model.NewRemote) (*model.Remote, error) {
	return r.repos.RemoteRepo.CreateRemote(ctx, &input)
}

func (r *mutationResolver) DeleteRemote(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateRefraction(ctx context.Context, input model.NewRefract) (*model.Refraction, error) {
	return r.repos.RefractRepo.CreateRefraction(ctx, &input)
}

func (r *mutationResolver) DeleteRefraction(ctx context.Context, id string) (bool, error) {
	panic(fmt.Errorf("not implemented"))
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

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
