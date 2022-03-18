package policy

import "context"

type Enforcer interface {
	CanReceive(ctx context.Context, path string) bool
	CanCache(ctx context.Context, path string) bool
}
