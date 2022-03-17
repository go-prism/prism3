package repo

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gorm.io/gorm"
)

func NewTransportRepo(db *gorm.DB) *TransportRepo {
	return &TransportRepo{
		db: db,
	}
}

func (r *TransportRepo) ListTransports(ctx context.Context) ([]*model.TransportSecurity, error) {
	var result []*model.TransportSecurity
	if err := r.db.Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list transports")
		return nil, err
	}
	return result, nil
}
