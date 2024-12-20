/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package policy

import (
	"context"
	"github.com/djcass44/go-utils/utilities/sliceutils"
	"github.com/go-logr/logr"
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

func NewRegexEnforcer(ctx context.Context, r *model.Remote) *RegexEnforcer {
	log := logr.FromContextOrDiscard(ctx)
	allow := make([]*regexp.Regexp, len(r.Security.Allowed))
	for i := range allow {
		log.V(2).Info("compiling ALLOW regex", r.Security.Allowed[i])
		allow[i] = regexp.MustCompile(r.Security.Allowed[i])
	}
	block := make([]*regexp.Regexp, len(r.Security.Blocked))
	for i := range block {
		log.V(2).Info("compiling BLOCK regex", r.Security.Blocked[i])
		block[i] = regexp.MustCompile(r.Security.Blocked[i])
	}
	log.V(1).Info("successfully compiled regex policies", "AllowedCount", len(allow), "BlockedCount", len(block))
	return &RegexEnforcer{
		archetype: r.Archetype,
		allow:     allow,
		block:     block,
	}
}

func (r *RegexEnforcer) CanReceive(ctx context.Context, path string) bool {
	attributes := []attribute.KeyValue{
		attribute.String("archetype", string(r.archetype)),
		attribute.String("path", path),
	}
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "policy_regex_canReceive", trace.WithAttributes(attributes...))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", path, "Archetype", r.archetype)
	log.V(1).Info("validating regex receiver policy")
	if r.anyMatch(path, r.block) {
		log.V(1).Info("blocked by blocklist")
		metricReceive.Add(ctx, 1, append(attributes, attribute.Bool("allowed", false))...)
		return false
	}
	if len(r.allow) > 0 && !r.anyMatch(path, r.allow) {
		log.V(1).Info("blocked by allowlist")
		metricReceive.Add(ctx, 1, append(attributes, attribute.Bool("allowed", false))...)
		return false
	}
	metricReceive.Add(ctx, 1, append(attributes, attribute.Bool("allowed", true))...)
	return true
}

func (r *RegexEnforcer) CanCache(ctx context.Context, path string) bool {
	attributes := []attribute.KeyValue{
		attribute.String("archetype", string(r.archetype)),
		attribute.String("path", path),
	}
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "policy_regex_canCache", trace.WithAttributes(attributes...))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", path, "Archetype", r.archetype)
	log.V(1).Info("validating regex cache policy")
	if r.archetype == "" {
		log.V(1).Info("cannot cache data without an archetype")
		metricCache.Add(ctx, 1, append(attributes, attribute.Bool("allowed", false))...)
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
	log.V(1).Info("successfully checked cache policy", "Cache", canCache)
	metricCache.Add(ctx, 1, append(attributes, attribute.Bool("allowed", canCache))...)
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
