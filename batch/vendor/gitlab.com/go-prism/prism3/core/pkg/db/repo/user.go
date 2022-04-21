package repo

import (
	"context"
	"fmt"
	"github.com/getsentry/sentry-go"
	log "github.com/sirupsen/logrus"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{
		db: db,
	}
}

// CreateCtx creates a model.StoredUser based on the user
// inside the current context.Context
func (r *UserRepo) CreateCtx(ctx context.Context) (*model.StoredUser, error) {
	user, _ := client.GetContextUser(ctx)
	u := &model.StoredUser{
		ID:     user.AsUsername(),
		Sub:    user.Sub,
		Iss:    user.Iss,
		Claims: user.Claims,
	}
	if err := r.db.Clauses(clause.OnConflict{UpdateAll: true}).Create(u).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to store user profile")
		sentry.CaptureException(err)
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) SetPreference(ctx context.Context, key, value string) error {
	user, ok := client.GetContextUser(ctx)
	if !ok {
		return errs.ErrUnauthorised
	}
	if err := r.db.Model(&model.StoredUser{}).Where("id = ?", user.AsUsername()).Update("preferences", gorm.Expr("preferences::jsonb || ?", fmt.Sprintf(`{"%s": "%s"}`, key, value))).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to update preferences")
		sentry.CaptureException(err)
		return err
	}
	return nil
}

func (r *UserRepo) Count(ctx context.Context) (int64, error) {
	var result int64
	if err := r.db.Model(&model.StoredUser{}).Count(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to count users")
		sentry.CaptureException(err)
		return 0, err
	}
	return result, nil
}
