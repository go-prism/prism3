package partition

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/jellydator/ttlcache/v3"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type GitLabPartition struct {
	cache *ttlcache.Cache[string, string]
}

func NewGitLabPartition() *GitLabPartition {
	return &GitLabPartition{
		cache: ttlcache.New(ttlcache.WithCapacity[string, string](1000), ttlcache.WithTTL[string, string](time.Hour)),
	}
}

// getAPIAddr returns the GitLab V4 API address
// from a given remote URL.
func (*GitLabPartition) getAPIAddr(uri string) (string, bool) {
	if !strings.Contains(uri, "/api/v4") {
		return "", false
	}
	host, _, _ := strings.Cut(uri, "/api/v4")
	if host == "" {
		return "", false
	}
	return fmt.Sprintf("%s/api/v4/job", host), true
}

func (g *GitLabPartition) Apply(ctx context.Context, rem RemoteLike, key, value string) (string, bool) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "partition_gitlab_apply", trace.WithAttributes(
		attribute.String("remote", rem.String()),
		attribute.String("key", key),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Key", key)
	if http.CanonicalHeaderKey(key) != http.CanonicalHeaderKey("Job-Token") {
		log.V(1).Info("skipping partition key generation")
		span.SetAttributes(
			attribute.Bool("skipped", true),
			attribute.String("expected", "Job-Token"),
		)
		span.AddEvent("skipped as header is unexpected")
		return value, false
	}
	log.V(1).Info("extracting partition key from GitLab job token")

	// short-circuit and bail out if the value is empty
	if value == "" {
		log.V(1).Info("skipping partition key generation as value is empty")
		span.SetAttributes(attribute.Bool("skipped", true))
		span.AddEvent("skipped as header value is empty")
		return value, false
	}
	span.SetAttributes(attribute.Bool("skipped", false))

	// check if it's cached
	val := g.cache.Get(value)
	if val != nil {
		log.V(1).Info("found existing partition key", "PartitionID", val.Value())
		span.SetAttributes(attribute.Bool("cached", true))
		return val.Value(), false
	}
	span.SetAttributes(attribute.Bool("cached", false))

	// otherwise query gitlab
	dst, ok := g.getAPIAddr(rem.String())
	if !ok {
		log.V(1).Info("unable to find GitLab API URL in given remote", "Url", rem.String())
		return value, false
	}
	log.V(1).Info("preparing request to GitLab", "Url", dst)
	span.SetAttributes(attribute.String("gitlab_api_url", dst))

	// execute the request
	resp, err := rem.Do(ctx, http.MethodGet, dst, &schemas.RequestContext{
		AuthOpts: httpclient.AuthOpts{
			Mode:   httpclient.AuthHeader,
			Header: key,
			Token:  value,
		},
	})
	if err != nil {
		return value, false
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Error(err, "failed to read response body")
		span.RecordError(err)
		return value, false
	}
	log.V(3).Info("successfully queried GitLab for job information", "Raw", string(data))
	var job gitLabJobResponse
	if err := json.Unmarshal(data, &job); err != nil {
		log.Error(err, "failed to unmarshal response")
		span.RecordError(err)
		return value, false
	}
	log.V(1).Info("resolved partition key", "PartitionID", job.User.ID)

	// update the cache
	jobID := strconv.Itoa(job.User.ID)
	g.cache.Set(value, jobID, time.Hour)

	return jobID, true
}
