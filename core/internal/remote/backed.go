package remote

import (
	"bytes"
	"context"
	"errors"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/policy"
	"gitlab.com/go-prism/prism3/core/internal/storage"
	"io"
	"net/url"
	"path/filepath"
	"strings"
)

type BackedRemote struct {
	rm       *model.Remote
	eph      Remote
	onCreate repo.CreateArtifactFunc
	pol      policy.Enforcer
	store    storage.Reader
}

func NewBackedRemote(rm *model.Remote, store storage.Reader, onCreate repo.CreateArtifactFunc) *BackedRemote {
	var eph Remote
	if rm.Archetype == model.ArchetypeHelm {
		eph = NewHelmRemote(rm.URI)
	} else {
		eph = NewEphemeralRemote(rm.URI)
	}
	return &BackedRemote{
		rm:       rm,
		eph:      eph,
		onCreate: onCreate,
		pol:      policy.NewRegexEnforcer(rm),
		store:    store,
	}
}

func (b *BackedRemote) String() string {
	return b.eph.String()
}

func (b *BackedRemote) Exists(ctx context.Context, path string) (string, error) {
	// check that this remote is allowed to receive the file
	if !b.pol.CanReceive(ctx, path) {
		return "", errors.New("blocked by policy")
	}
	uploadPath, normalPath := b.getPath(ctx, path)
	canCache := b.pol.CanCache(ctx, path)
	if canCache {
		ok, _ := b.store.Head(ctx, uploadPath)
		if ok {
			return path, nil
		}
	}
	// HEAD the remote
	uri, err := b.eph.Exists(ctx, path)
	if err != nil {
		return "", err
	}
	// check that this remote is allowed to cache the file
	if canCache {
		_ = b.onCreate(ctx, normalPath, b.rm.ID)
	}
	return uri, nil
}

func (b *BackedRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	canCache := b.pol.CanCache(ctx, path)
	uploadPath, normalPath := b.getPath(ctx, path)
	// check the cache first
	if canCache {
		ok, _ := b.store.Head(ctx, uploadPath)
		if ok {
			return b.store.Get(ctx, uploadPath)
		}
	}

	r, err := b.eph.Download(ctx, path)
	if err != nil {
		return nil, err
	}
	// check that this remote is allowed to cache the file
	if canCache {
		_ = b.onCreate(ctx, normalPath, b.rm.ID)
		buf := new(bytes.Buffer)
		// duplicate the data, so we can upload it
		// to storage and return it to the user
		tee := io.TeeReader(r, buf)
		// upload to storage
		_ = b.store.Put(ctx, uploadPath, tee)
		return buf, nil
	}
	return r, nil
}

func (b *BackedRemote) getPath(ctx context.Context, path string) (string, string) {
	uploadPath := strings.TrimPrefix(path, b.rm.URI)
	if strings.HasPrefix(uploadPath, "https://") {
		uri, err := url.Parse(uploadPath)
		if err != nil {
			log.WithContext(ctx).Error("failed to parse URI")
		} else {
			uploadPath = uri.Path
		}
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"path":       path,
		"uploadPath": uploadPath,
	}).Debug("normalised path")
	return filepath.Join(b.rm.Name, uploadPath), uploadPath
}
