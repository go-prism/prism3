package repo

import (
	"context"
	"fmt"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gorm.io/gorm"
	"strings"
	"time"
)

func NewRefractRepo(db *gorm.DB) *RefractRepo {
	return &RefractRepo{
		db: db,
	}
}

func getAnyQuery(vals []string) string {
	items := make([]string, len(vals))
	for i := range vals {
		items[i] = fmt.Sprintf(`"%s"`, vals[i])
	}
	return fmt.Sprintf("{%s}", strings.Join(items, ","))
}

func (r *RefractRepo) PatchRefraction(ctx context.Context, id string, in *model.PatchRefract) (*model.Refraction, error) {
	// fetch the original refraction
	var ref model.Refraction
	if err := r.db.Where("id = ?", id).First(&ref).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to fetch refraction")
		return nil, err
	}
	// fetch the remotes
	var remotes []*model.Remote
	if err := r.db.Where("id = ANY(?::uuid[])", getAnyQuery(in.Remotes)).Find(&remotes).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve remotes")
		return nil, err
	}
	// update the refraction
	ref.Name = in.Name
	ref.Remotes = remotes
	ref.UpdatedAt = time.Now().Unix()
	// save the changes
	if err := r.db.Save(&ref).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to update refraction")
		return nil, err
	}
	return &ref, nil
}

func (r *RefractRepo) CreateRefraction(ctx context.Context, in *model.NewRefract) (*model.Refraction, error) {
	var remotes []*model.Remote
	if err := r.db.Where("id = ANY(?::uuid[])", getAnyQuery(in.Remotes)).Find(&remotes).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve remotes")
		return nil, err
	}
	result := model.Refraction{
		ID:        uuid.NewV4().String(),
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
		Name:      in.Name,
		Archetype: in.Archetype,
		Remotes:   remotes,
	}
	if err := r.db.Create(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to create refraction")
		return nil, err
	}
	return &result, nil
}

func (r *RefractRepo) GetRefractionByName(ctx context.Context, name string) (*model.Refraction, error) {
	var result model.Refraction
	if err := r.db.Preload("Remotes").Preload("Remotes.Security").Preload("Remotes.Transport").Where("name = ?", name).First(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get refraction")
		return nil, err
	}
	return &result, nil
}

func (r *RefractRepo) GetRefraction(ctx context.Context, id string) (*model.Refraction, error) {
	var result model.Refraction
	if err := r.db.Preload("Remotes").Where("id = ?", id).First(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get refraction")
		return nil, err
	}
	return &result, nil
}

func (r *RefractRepo) ListRefractions(ctx context.Context) ([]*model.Refraction, error) {
	var result []*model.Refraction
	if err := r.db.Preload("Remotes").Find(&result).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to list refractions")
		return nil, err
	}
	return result, nil
}
