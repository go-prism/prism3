module gitlab.com/go-prism/prism3/goproxy

go 1.18

replace gitlab.com/go-prism/prism3/core => ../core

replace gitlab.com/go-prism/go-rbac-proxy v0.2.0 => gitlab.dcas.dev/prism/go-rbac-proxy.git v0.2.0

replace gitlab.com/go-prism/go-rbac-proxy v0.2.1 => gitlab.dcas.dev/prism/go-rbac-proxy.git v0.2.1

require (
	github.com/aws/aws-sdk-go-v2/service/s3 v1.26.0
	github.com/djcass44/go-utils/flagging v0.1.2
	github.com/djcass44/go-utils/logging v0.1.0
	github.com/djcass44/go-utils/otel v0.1.4
	github.com/go-logr/logr v1.2.3
	github.com/goproxy/goproxy v0.10.2
	github.com/gorilla/mux v1.8.0
	github.com/kelseyhightower/envconfig v1.4.0
	gitlab.com/autokubeops/serverless v0.4.2
	gitlab.com/go-prism/prism3/core v0.0.0-00010101000000-000000000000
	go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux v0.32.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.32.0
	go.opentelemetry.io/otel v1.7.0
	go.opentelemetry.io/otel/metric v0.30.0
	go.opentelemetry.io/otel/trace v1.7.0
	go.uber.org/zap v1.21.0
)

require (
	github.com/Masterminds/semver/v3 v3.1.1 // indirect
	github.com/Unleash/unleash-client-go/v3 v3.5.0 // indirect
	github.com/aws/aws-sdk-go-v2 v1.16.4 // indirect
	github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream v1.4.0 // indirect
	github.com/aws/aws-sdk-go-v2/config v1.15.0 // indirect
	github.com/aws/aws-sdk-go-v2/credentials v1.10.0 // indirect
	github.com/aws/aws-sdk-go-v2/feature/ec2/imds v1.12.0 // indirect
	github.com/aws/aws-sdk-go-v2/feature/s3/manager v1.11.0 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.1.11 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.4.5 // indirect
	github.com/aws/aws-sdk-go-v2/internal/ini v1.3.7 // indirect
	github.com/aws/aws-sdk-go-v2/service/dynamodb v1.15.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.9.1 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/checksum v1.1.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/endpoint-discovery v1.7.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.9.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/s3shared v1.13.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/sso v1.11.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/sts v1.16.0 // indirect
	github.com/aws/smithy-go v1.11.2 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/cenkalti/backoff/v4 v4.1.3 // indirect
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/djcass44/go-tracer v0.3.0 // indirect
	github.com/djcass44/go-utils v0.2.1-0.20210516001550-3d288882b7f4 // indirect
	github.com/felixge/httpsnoop v1.0.3 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-logr/zapr v1.2.3 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/google/uuid v1.3.0 // indirect
	github.com/gorilla/handlers v1.5.1 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/levigross/grequests v0.0.0-20190908174114-253788527a1a // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.2-0.20181231171920-c182affec369 // indirect
	github.com/prometheus/client_golang v1.12.1 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.32.1 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	github.com/sirupsen/logrus v1.8.1 // indirect
	github.com/twmb/murmur3 v1.1.6 // indirect
	gitlab.com/av1o/cap10 v0.4.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws v0.32.0 // indirect
	go.opentelemetry.io/otel/exporters/jaeger v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/prometheus v0.30.0 // indirect
	go.opentelemetry.io/otel/sdk v1.7.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v0.30.0 // indirect
	go.uber.org/atomic v1.9.0 // indirect
	go.uber.org/automaxprocs v1.5.2-0.20220426165107-d835ace014b3 // indirect
	go.uber.org/multierr v1.8.0 // indirect
	golang.org/x/crypto v0.0.0-20220525230936-793ad666bf5e // indirect
	golang.org/x/mod v0.6.0-dev.0.20211013180041-c96bc1413d57 // indirect
	golang.org/x/net v0.0.0-20220526153639-5463443f8c37 // indirect
	golang.org/x/sys v0.0.0-20220520151302-bc2c85ada10a // indirect
	golang.org/x/text v0.3.7 // indirect
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 // indirect
	google.golang.org/genproto v0.0.0-20220527130721-00d5c0f3be58 // indirect
	google.golang.org/grpc v1.46.2 // indirect
	google.golang.org/protobuf v1.28.0 // indirect
)
