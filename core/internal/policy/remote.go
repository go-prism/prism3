package policy

import (
	"context"
	"github.com/djcass44/go-utils/pkg/sliceutils"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"path/filepath"
	"regexp"
	"strings"
)

var (
	RegexDebian        = regexp.MustCompile(`^.*\.(deb|tar.gz)$`)
	RegexNode          = regexp.MustCompile(`.tgz$`)
	RegexHelm          = regexp.MustCompile(`.tgz(.prov)?$`)
	RegexPy            = regexp.MustCompile(`.(tar.gz|whl)$`)
	ExcludedExtensions = []string{
		".js",
		".html",
		".css",
	}
)

type RegexEnforcer struct {
	archetype model.Archetype
	allow     []*regexp.Regexp
	block     []*regexp.Regexp
}

func NewRegexEnforcer(r *model.Remote) *RegexEnforcer {
	allow := make([]*regexp.Regexp, len(r.Security.Allowed))
	for i := range allow {
		allow[i] = regexp.MustCompile(r.Security.Allowed[i])
	}
	block := make([]*regexp.Regexp, len(r.Security.Blocked))
	for i := range block {
		block[i] = regexp.MustCompile(r.Security.Blocked[i])
	}
	return &RegexEnforcer{
		archetype: r.Archetype,
		allow:     allow,
		block:     block,
	}
}

func (r *RegexEnforcer) CanReceive(ctx context.Context, path string) bool {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "policy_regex_canReceive", trace.WithAttributes(
		attribute.String("archetype", string(r.archetype)),
		attribute.String("path", path),
	))
	defer span.End()
	if r.anyMatch(path, r.block) {
		log.WithContext(ctx).WithField("path", path).Debug("blocked by blocklist")
		return false
	}
	if len(r.allow) > 0 && !r.anyMatch(path, r.allow) {
		log.WithContext(ctx).WithField("path", path).Debug("blocked by allowlist")
		return false
	}
	return true
}

func (r *RegexEnforcer) CanCache(ctx context.Context, path string) bool {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "policy_regex_canCache", trace.WithAttributes(
		attribute.String("archetype", string(r.archetype)),
		attribute.String("path", path),
	))
	defer span.End()
	if r.archetype == "" {
		return false
	}
	canCache := true
	switch r.archetype {
	case model.ArchetypeNpm:
		canCache = RegexNode.MatchString(path)
	case model.ArchetypeMaven:
		canCache = !strings.HasSuffix(path, "maven-metadata.xml")
	case model.ArchetypeAlpine:
		canCache = !strings.HasSuffix(path, "APKINDEX.tar.gz")
	case model.ArchetypeDebian:
		canCache = RegexDebian.MatchString(path)
	case model.ArchetypeHelm:
		canCache = RegexHelm.MatchString(path)
	case model.ArchetypePip:
		// handle downloads having a fragment
		uri, _, ok := strings.Cut(path, "#")
		if ok {
			canCache = RegexPy.MatchString(uri)
			break
		}
		canCache = RegexPy.MatchString(path)
	default:
		canCache = r.canCacheGeneric(path)
	}
	span.SetAttributes(attribute.Bool("can_cache", canCache))
	log.WithContext(ctx).WithFields(log.Fields{
		"path":  path,
		"cache": canCache,
		"arch":  r.archetype,
	}).Debug("checked cache status")
	return canCache
}

// canCacheGeneric excludes common Web resources
// (e.g., html, js, css)
func (*RegexEnforcer) canCacheGeneric(path string) bool {
	ext := filepath.Ext(path)
	return !sliceutils.Includes(ExcludedExtensions, ext)
}

func (*RegexEnforcer) anyMatch(path string, rules []*regexp.Regexp) bool {
	// check if any regex matches the path
	for _, r := range rules {
		if r.MatchString(path) {
			return true
		}
	}
	return false
}
