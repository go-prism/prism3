module gitlab.com/go-prism/prism3/goproxy

go 1.20

replace gitlab.com/go-prism/prism3/core => ../core

replace gitlab.com/go-prism/go-rbac-proxy v0.2.0 => gitlab.dcas.dev/prism/go-rbac-proxy.git v0.2.0

replace gitlab.com/go-prism/go-rbac-proxy v0.2.1 => gitlab.dcas.dev/prism/go-rbac-proxy.git v0.2.1

require (
	github.com/aws/aws-sdk-go-v2/service/s3 v1.26.0
	github.com/djcass44/go-utils/flagging v0.1.3
	github.com/djcass44/go-utils/logging v0.2.3
	github.com/djcass44/go-utils/otel v0.1.6
	github.com/go-logr/logr v1.2.3
	github.com/goproxy/goproxy v0.10.2
	github.com/gorilla/mux v1.8.0
	github.com/kelseyhightower/envconfig v1.4.0
	gitlab.com/autokubeops/serverless v0.6.0
	gitlab.com/go-prism/prism3/core v0.0.0-00010101000000-000000000000
	go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux v0.32.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.32.0
	go.opentelemetry.io/otel v1.14.0
	go.opentelemetry.io/otel/metric v0.30.0
	go.opentelemetry.io/otel/trace v1.14.0
	go.uber.org/zap v1.24.0
)

require (
	github.com/KimMachineGun/automemlimit v0.2.4 // indirect
	github.com/Masterminds/semver/v3 v3.2.0 // indirect
	github.com/Unleash/unleash-client-go/v3 v3.7.3 // indirect
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
	github.com/cenkalti/backoff/v4 v4.2.0 // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/cilium/ebpf v0.10.0 // indirect
	github.com/containerd/cgroups v1.1.0 // indirect
	github.com/coreos/go-systemd/v22 v22.5.0 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/djcass44/go-probe-lib v0.1.1 // indirect
	github.com/djcass44/go-tracer v0.3.0 // indirect
	github.com/djcass44/go-utils/utilities v0.1.1 // indirect
	github.com/docker/go-units v0.5.0 // indirect
	github.com/felixge/httpsnoop v1.0.3 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-logr/zapr v1.2.3 // indirect
	github.com/godbus/dbus/v5 v5.1.0 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/google/uuid v1.3.0 // indirect
	github.com/gorilla/handlers v1.5.1 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/levigross/grequests v0.0.0-20221222020224-9eee758d18d5 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.2-0.20181231171920-c182affec369 // indirect
	github.com/opencontainers/runtime-spec v1.1.0-rc.1 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/prometheus/client_golang v1.12.1 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.32.1 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	github.com/sirupsen/logrus v1.9.0 // indirect
	github.com/stretchr/objx v0.5.0 // indirect
	github.com/stretchr/testify v1.8.2 // indirect
	github.com/twmb/murmur3 v1.1.6 // indirect
	gitlab.com/av1o/cap10 v0.4.1 // indirect
	go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws v0.32.0 // indirect
	go.opentelemetry.io/otel/exporters/jaeger v1.14.0 // indirect
	go.opentelemetry.io/otel/exporters/prometheus v0.30.0 // indirect
	go.opentelemetry.io/otel/sdk v1.14.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v0.30.0 // indirect
	go.uber.org/atomic v1.10.0 // indirect
	go.uber.org/automaxprocs v1.5.2-0.20220426165107-d835ace014b3 // indirect
	go.uber.org/multierr v1.9.0 // indirect
	golang.org/x/crypto v0.6.0 // indirect
	golang.org/x/mod v0.6.0-dev.0.20220419223038-86c51ed26bb4 // indirect
	golang.org/x/net v0.7.0 // indirect
	golang.org/x/sys v0.5.0 // indirect
	golang.org/x/text v0.7.0 // indirect
	google.golang.org/genproto v0.0.0-20230227214838-9b19f0bdc514 // indirect
	google.golang.org/grpc v1.53.0 // indirect
	google.golang.org/protobuf v1.28.1 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
