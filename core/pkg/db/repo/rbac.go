package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

func NewRBACRepo(db *gorm.DB) *RBACRepo {
	return &RBACRepo{
		db: db,
	}
}

func (r *RBACRepo) Create(ctx context.Context, in *model.NewRoleBinding) (*model.RoleBinding, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_rbac_create")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("creating RoleBinding")
	rb := &model.RoleBinding{
		Subject:  in.Subject,
		Role:     in.Role,
		Resource: in.Resource,
	}
	if err := r.db.WithContext(ctx).Create(rb).Error; err != nil {
		log.Error(err, "failed to create role binding")
		sentry.CaptureException(err)
		return nil, err
	}
	return rb, nil
}

func (r *RBACRepo) List(ctx context.Context) ([]*model.RoleBinding, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_rbac_list")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing RoleBindings")
	var results []*model.RoleBinding
	if err := r.db.WithContext(ctx).Find(&results).Error; err != nil {
		log.Error(err, "failed to lookup role bindings")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}

func (r *RBACRepo) ListForRole(ctx context.Context, role model.Role) ([]*model.RoleBinding, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_rbac_listForRole", trace.WithAttributes(
		attribute.String("role", string(role)),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing bindings for role", "Role", role.String())
	var results []*model.RoleBinding
	if err := r.db.WithContext(ctx).Where("role = ?", role).Find(&results).Error; err != nil {
		log.Error(err, "failed to lookup bindings for role")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}

func (r *RBACRepo) ListForSubject(ctx context.Context, user string) ([]*model.RoleBinding, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "repo_rbac_listForSubject", trace.WithAttributes(
		attribute.String("subject", user),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("listing bindings for subject", "Subject", user)
	var results []*model.RoleBinding
	if err := r.db.WithContext(ctx).Where("subject = ?", user).Find(&results).Error; err != nil {
		log.Error(err, "failed to lookup subjects bindings")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}
