package storage

import (
	"bytes"
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws"
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
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.WithError(err).Error("failed to retrieve AWS config")
		return nil, err
	}
	// OpenTelemetry instrumentation
	otelaws.AppendMiddlewares(&cfg.APIOptions)
	log.WithContext(ctx).WithFields(log.Fields{
		"pathStyle": opt.PathStyle,
		"region":    opt.Region,
		"endpoint":  opt.Endpoint,
		"bucket":    opt.Bucket,
	}).Info("creating S3 client")
	client := s3.NewFromConfig(cfg, func(options *s3.Options) {
		options.UsePathStyle = opt.PathStyle
		options.Region = opt.Region
		options.EndpointResolver = s3.EndpointResolverFromURL(opt.Endpoint, func(endpoint *aws.Endpoint) {
			endpoint.HostnameImmutable = opt.PathStyle
			endpoint.SigningRegion = opt.Region
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
	fields := log.Fields{"path": path}
	log.WithContext(ctx).WithFields(fields).Debug("downloading object")
	// create a temporary buffer
	buf := manager.NewWriteAtBuffer(nil)
	// download the file
	n, err := s.downloader.Download(ctx, buf, &s3.GetObjectInput{
		Bucket: s.bucket,
		Key:    aws.String(path),
	})
	log.WithContext(ctx).WithFields(fields).Debugf("downloaded %d bytes", n)
	if err != nil {
		log.WithContext(ctx).WithError(err).WithFields(fields).Error("failed to download object")
		return nil, err
	}
	return bytes.NewReader(buf.Bytes()), nil
}

func (s *S3) Put(ctx context.Context, path string, r io.Reader) error {
	fields := log.Fields{"path": path}
	log.WithContext(ctx).WithFields(fields).Debug("uploading object")
	// upload the file
	result, err := s.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket: s.bucket,
		Key:    aws.String(path),
		Body:   r,
	})
	if err != nil {
		log.WithContext(ctx).WithError(err).WithFields(fields).Error("failed to upload object")
		return err
	}
	log.WithContext(ctx).WithFields(fields).Debugf("uploaded file to %s", result.Location)
	return nil
}

func (s *S3) Head(ctx context.Context, path string) (bool, error) {
	fields := log.Fields{"path": path}
	log.WithContext(ctx).WithFields(fields).Debug("checking for object")
	_, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: s.bucket,
		Key:    aws.String(path),
	})
	if err != nil {
		log.WithContext(ctx).WithError(err).WithFields(fields).Error("failed to head S3 object")
		return false, err
	}
	log.WithContext(ctx).WithFields(fields).Debug("successfully located file in S3")
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
	log.WithContext(ctx).Debug("listing objects")
	var token *string
	for {
		log.WithContext(ctx).Debugf("fetching page with token: '%+v'", token)
		result, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
			Bucket:            s.bucket,
			Prefix:            aws.String(prefix),
			ContinuationToken: token,
		})
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to list objects")
			return err
		}
		for _, o := range result.Contents {
			iter(o)
		}
		log.WithContext(ctx).Debugf("fetched %d objects, truncated: %v", result.KeyCount, result.IsTruncated)
		if !result.IsTruncated {
			log.WithContext(ctx).Debug("response not truncated, exiting")
			return nil
		}
		if result.NextContinuationToken != nil {
			token = aws.String(*result.NextContinuationToken)
		}
	}
}
