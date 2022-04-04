package repo

import (
	"context"
	"github.com/getsentry/sentry-go"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gorm.io/gorm"
)

func NewRBACRepo(db *gorm.DB) *RBACRepo {
	return &RBACRepo{
		db: db,
	}
}

func (r *RBACRepo) Create(ctx context.Context, in *model.NewRoleBinding) (*model.RoleBinding, error) {
	rb := &model.RoleBinding{
		Subject:  in.Subject,
		Role:     in.Role,
		Resource: in.Resource,
	}
	if err := r.db.Create(rb).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create role binding")
		sentry.CaptureException(err)
		return nil, err
	}
	return rb, nil
}

func (r *RBACRepo) List(ctx context.Context) ([]*model.RoleBinding, error) {
	var results []*model.RoleBinding
	if err := r.db.Find(&results).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to lookup role bindings")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}

func (r *RBACRepo) ListForRole(ctx context.Context, role model.Role) ([]*model.RoleBinding, error) {
	var results []*model.RoleBinding
	if err := r.db.Where("role = ?", role).Find(&results).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to lookup bindings for role")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}

func (r *RBACRepo) ListForSubject(ctx context.Context, user string) ([]*model.RoleBinding, error) {
	var results []*model.RoleBinding
	if err := r.db.Where("subject = ?", user).Find(&results).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to lookup subjects bindings")
		sentry.CaptureException(err)
		return nil, err
	}
	return results, nil
}
