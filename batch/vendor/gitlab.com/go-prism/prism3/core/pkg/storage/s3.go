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

package storage

import (
	"bytes"
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"io"
)

type S3 struct {
	bucket     *string
	client     *s3.Client
	signClient *s3.PresignClient
	downloader *manager.Downloader
	uploader   *manager.Uploader
}

type S3Options struct {
	PathStyle bool   `split_words:"true"`
	Region    string `split_words:"true"`
	Endpoint  string `split_words:"true" default:"https://s3.amazonaws.com"`
	Bucket    string `split_words:"true"`
}

func NewS3(ctx context.Context, opt S3Options) (*S3, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("s3")
	log.V(1).Info("loading default AWS config from context")
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Error(err, "failed to retrieve AWS config")
		return nil, err
	}
	log.V(1).Info("successfully loaded AWS config")
	// OpenTelemetry instrumentation
	otelaws.AppendMiddlewares(&cfg.APIOptions)
	log.Info("creating S3 client", "PathStyle", opt.PathStyle, "Region", opt.Region, "Endpoint", opt.Endpoint, "Bucket", opt.Bucket)
	client := s3.NewFromConfig(cfg, func(options *s3.Options) {
		options.UsePathStyle = opt.PathStyle
		options.Region = opt.Region
		options.EndpointResolver = s3.EndpointResolverFromURL(opt.Endpoint, func(endpoint *aws.Endpoint) {
			endpoint.HostnameImmutable = opt.PathStyle
			endpoint.SigningRegion = opt.Region
			log.V(2).Info("configuration AWS endpoint resolver", "Endpoint", endpoint)
		})
	})
	return &S3{
		bucket:     aws.String(opt.Bucket),
		client:     client,
		signClient: s3.NewPresignClient(client),
		downloader: manager.NewDownloader(client),
		uploader:   manager.NewUploader(client),
	}, nil
}

func (s *S3) Get(ctx context.Context, path string) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "storage_s3_get", trace.WithAttributes(attribute.String("path", path)))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("s3").WithValues("Path", path, "Bucket", s.bucket)
	log.V(1).Info("downloading object")
	// create a temporary buffer
	buf := manager.NewWriteAtBuffer(nil)
	// download the file
	n, err := s.downloader.Download(ctx, buf, &s3.GetObjectInput{
		Bucket: s.bucket,
		Key:    aws.String(path),
	})
	metricGetSize.Add(ctx, n, attribute.String(attributeKeyPath, path), attribute.String(attributeKeyBucket, *s.bucket))
	log.V(1).Info("completed download", "Bytes", n)
	if err != nil {
		metricGetErrCount.Add(ctx, 1, attribute.String(attributeKeyPath, path), attribute.String(attributeKeyBucket, *s.bucket))
		log.Error(err, "failed to successfully download object")
		return nil, err
	}
	log.V(1).Info("successfully downloaded object")
	return bytes.NewReader(buf.Bytes()), nil
}

func (s *S3) Put(ctx context.Context, path string, r io.Reader) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "storage_s3_put", trace.WithAttributes(attribute.String("path", path)))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("s3").WithValues("Path", path, "Bucket", s.bucket)
	log.V(1).Info("uploading object")
	// upload the file
	result, err := s.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket: s.bucket,
		Key:    aws.String(path),
		Body:   r,
	})
	if err != nil {
		metricPutErrCount.Add(ctx, 1, attribute.String(attributeKeyPath, path), attribute.String(attributeKeyBucket, *s.bucket))
		log.Error(err, "failed to successfully upload object")
		return err
	}
	metricPutCount.Add(ctx, 1, attribute.String(attributeKeyPath, path), attribute.String(attributeKeyBucket, *s.bucket))
	log.V(1).Info("successfully uploaded file", "Location", result.Location, "UploadID", result.UploadID)
	return nil
}

func (s *S3) Head(ctx context.Context, path string) (bool, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "storage_s3_head", trace.WithAttributes(attribute.String("path", path)))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("s3").WithValues("Path", path, "Bucket", s.bucket)
	log.V(1).Info("checking for object")
	result, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: s.bucket,
		Key:    aws.String(path),
	})
	if err != nil {
		metricHeadErrCount.Add(ctx, 1, attribute.String(attributeKeyPath, path), attribute.String(attributeKeyBucket, *s.bucket))
		log.Error(err, "failed to HEAD s3 object")
		return false, err
	}
	metricHeadCount.Add(ctx, 1, attribute.String(attributeKeyPath, path), attribute.String(attributeKeyBucket, *s.bucket))
	log.V(1).Info("successfully located file in s3", "ContentLength", result.ContentLength)
	return true, nil
}

func (s *S3) Size(ctx context.Context, path string) (*BucketSize, error) {
	count := int64(0)
	size := int64(0)
	err := s.listObjectsV2(ctx, path, func(t types.Object) {
		count++
		size += t.Size
	})
	if err != nil {
		return nil, err
	}
	return &BucketSize{
		Count: count,
		Bytes: size,
	}, nil
}

// listObjectsV2 lists an entire S3 bucket and
// allows the caller to do something with each
// object.
func (s *S3) listObjectsV2(ctx context.Context, prefix string, iter func(t types.Object)) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "storage_s3_listObjectsV2", trace.WithAttributes(attribute.String("prefix", prefix)))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("s3").WithValues("Prefix", prefix, "Bucket", s.bucket)
	log.V(1).Info("listing objects")
	var token *string
	for {
		log.V(1).Info("fetching page", "Token", token)
		result, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
			Bucket:            s.bucket,
			Prefix:            aws.String(prefix),
			ContinuationToken: token,
		})
		if err != nil {
			log.Error(err, "failed to list objects")
			return err
		}
		for _, o := range result.Contents {
			iter(o)
		}
		log.V(1).Info("fetched page", "Count", result.KeyCount, "Truncated", result.IsTruncated)
		if !result.IsTruncated {
			log.V(1).Info("response not truncated, exiting")
			return nil
		}
		if result.NextContinuationToken != nil {
			token = aws.String(*result.NextContinuationToken)
			log.V(2).Info("found next continuation token", "Token", result.NextContinuationToken)
		}
	}
}
