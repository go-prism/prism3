package policy

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"regexp"
	"strings"
)

var (
	RegexDebian = regexp.MustCompile(`^.*\.(deb|tar.gz)$`)
	RegexNode   = regexp.MustCompile(`.tgz$`)
	RegexHelm   = regexp.MustCompile(`.tgz(.prov)?$`)
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
	default:
		canCache = true
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"path":  path,
		"cache": canCache,
		"arch":  r.archetype,
	}).Debug("checked cache status")
	return canCache
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
