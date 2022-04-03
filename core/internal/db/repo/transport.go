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

func (r *TransportRepo) CreateTransport(ctx context.Context, in *model.NewTransportProfile) (*model.TransportSecurity, error) {
	result := model.TransportSecurity{
		Name:          in.Name,
		Ca:            in.Ca,
		Cert:          in.Cert,
		Key:           in.Key,
		SkipTLSVerify: in.SkipTLSVerify,
		HTTPProxy:     in.HTTPProxy,
		HTTPSProxy:    in.HTTPSProxy,
		NoProxy:       in.NoProxy,
	}
	if err := r.db.Create(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create transport")
		return nil, err
	}
	return &result, nil
}

func (r *TransportRepo) ListTransports(ctx context.Context) ([]*model.TransportSecurity, error) {
	var result []*model.TransportSecurity
	if err := r.db.Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list transports")
		return nil, err
	}
	return result, nil
}
