package remote

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/partition"
	"gitlab.com/go-prism/prism3/core/internal/policy"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
	"net/url"
	"path/filepath"
	"strings"
)

var partitions = []partition.Partition{
	partition.NewGitLabPartition(),
}

type BackedRemote struct {
	rm       *model.Remote
	eph      Remote
	onCreate repo.CreateArtifactFunc
	pol      policy.Enforcer
	store    storage.Reader
}

func NewBackedRemote(ctx context.Context, rm *model.Remote, store storage.Reader, onCreate repo.CreateArtifactFunc, getPyPi, getHelm repo.GetPackageFunc) *BackedRemote {
	client := httpclient.GetConfigured(ctx, rm.Transport)
	var eph Remote
	switch rm.Archetype {
	case model.ArchetypeHelm:
		eph = NewHelmRemote(ctx, rm.URI, client, getHelm)
	case model.ArchetypePip:
		eph = NewPyPiRemote(ctx, rm.URI, client, getPyPi)
	default:
		eph = NewEphemeralRemote(ctx, rm.URI, client)
	}
	return &BackedRemote{
		rm:       rm,
		eph:      eph,
		onCreate: onCreate,
		pol:      policy.NewRegexEnforcer(ctx, rm),
		store:    store,
	}
}

func (b *BackedRemote) String() string {
	return b.eph.String()
}

func (b *BackedRemote) Model() *model.Remote {
	return b.rm
}

func (b *BackedRemote) validateContext(ctx context.Context, rctx *schemas.RequestContext) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_backed_validateContext")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	if rctx == nil {
		log.V(1).Info("skipping context validation as context is nil")
		return
	}
	if rctx.Mode == httpclient.AuthNone {
		log.V(1).Info("skipping context validation as no authentication information has been provided by the client")
		return
	}
	eph, ok := b.eph.(*EphemeralRemote)
	if !ok {
		log.V(1).Info("skipping context validation as remote is not ephemeral")
		return
	}
	log.V(1).Info("starting context validation", "Count", len(partitions))
	for _, p := range partitions {
		val, ok := p.Apply(ctx, eph, rctx.Header, rctx.Token)
		if ok {
			log.V(1).Info("completed context validation")
			rctx.PartitionID = val
			return
		}
	}
	log.V(1).Info("completed context validation with no validator action")
}

func (b *BackedRemote) Exists(ctx context.Context, path string, rctx *schemas.RequestContext) (string, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_backed_exists")
	defer span.End()
	// check that this remote is allowed to receive the file
	if !b.pol.CanReceive(ctx, path) {
		return "", errors.New("blocked by policy")
	}
	b.validateContext(ctx, rctx)
	uploadPath, normalPath := b.getPath(ctx, path, rctx)
	canCache := b.pol.CanCache(ctx, path)
	if canCache {
		ok, _ := b.store.Head(ctx, uploadPath)
		if ok {
			return path, nil
		}
	}
	// HEAD the remote
	uri, err := b.eph.Exists(ctx, path, rctx)
	if err != nil {
		return "", err
	}
	// check that this remote is allowed to cache the file
	if canCache {
		_ = b.onCreate(ctx, normalPath, b.rm.ID)
	}
	return uri, nil
}

func (b *BackedRemote) Download(ctx context.Context, path string, rctx *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_backed_download")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path")
	log.V(2).Info("using request context", "RequestContext", rctx)

	b.validateContext(ctx, rctx)

	// validate or set auth
	if b.rm.Security.AuthMode == model.AuthModeNone {
		log.V(1).Info("wiping request context")
		rctx.Mode = httpclient.AuthNone
	}

	log.V(2).Info("using final request context", "RequestContext", rctx)
	canCache := b.pol.CanCache(ctx, path)
	uploadPath, normalPath := b.getPath(ctx, path, rctx)
	log = log.WithValues("Cache", canCache, "PathNormal", normalPath, "PathStore", uploadPath)
	// check the cache first
	if canCache {
		log.V(1).Info("checking cache for existing file")
		ok, _ := b.store.Head(ctx, uploadPath)
		if ok {
			log.V(1).Info("located existing file in cache")
			if canCache {
				_ = b.onCreate(ctx, normalPath, b.rm.ID)
			}
			return b.store.Get(ctx, uploadPath)
		}
	}

	r, err := b.eph.Download(ctx, path, rctx)
	if err != nil {
		return nil, err
	}
	// check that this remote is allowed to cache the file
	if canCache {
		log.V(1).Info("preparing to upload to cache")
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

func (b *BackedRemote) getPath(ctx context.Context, path string, rctx *schemas.RequestContext) (string, string) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_backed_getPath")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path")
	log.V(2).Info("using request context", "RequestContext", rctx)
	uploadPath := strings.TrimPrefix(path, b.rm.URI)
	if strings.HasPrefix(uploadPath, "https://") {
		uri, err := url.Parse(uploadPath)
		if err != nil {
			log.Error(err, "failed to parse URI")
		} else {
			uploadPath = strings.TrimPrefix(uri.Path, "/")
		}
	}
	// create the cache partition by appending
	// the hash of the token
	if rctx.Mode != httpclient.AuthNone && rctx.Token != "" {
		// use the partition ID if present
		partId := rctx.PartitionID
		if partId == "" {
			log.V(2).Info("explicit partition ID is not set, falling back to authorisation token")
			partId = rctx.Token
		}
		partId = hash(partId)
		log.V(1).Info("creating partition", "PartitionHash", partId, "PartitionID", rctx.PartitionID)
		uploadPath = filepath.Join(uploadPath, partId)
	}
	log.V(1).Info("normalised path", "UploadPath", uploadPath)
	return filepath.Join(b.rm.Name, uploadPath), uploadPath
}

// hash returns the hex-encoded SHA256 sum of
// the given string
func hash(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}
