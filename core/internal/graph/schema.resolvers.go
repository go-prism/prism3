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
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) GetRefraction(ctx context.Context, id string) (*model.Refraction, error) {
	return r.repos.RefractRepo.GetRefraction(ctx, id)
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
