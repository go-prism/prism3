package serverless

import (
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	_ "go.uber.org/automaxprocs"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

var (
	MetricNamespace = "serverless"
	MetricSubsystem = "function"
)

var (
	metricOpsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: MetricNamespace,
		Subsystem: MetricSubsystem,
		Name:      "ops_total",
	}, []string{"method", "path"})
	metricOpsDurationTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: MetricNamespace,
		Subsystem: MetricSubsystem,
		Name:      "ops_duration_total",
	}, []string{"method", "path"})
	metricOpsDurationHistogram = promauto.NewHistogram(prometheus.HistogramOpts{
		Namespace: MetricNamespace,
		Subsystem: MetricSubsystem,
		Name:      "ops_duration_ms",
		Help:      "Histogram for function execution duration",
		Buckets:   prometheus.LinearBuckets(1, 10, 100),
	})
)

const (
	HeaderContentType = "Content-Type"
	ApplicationGRPC   = "application/grpc"
)

type Builder struct {
	handler        http.Handler
	gsrv           *grpc.Server
	port           int
	enableHandlers bool
	enableMetrics  bool
}

func NewBuilder(handler http.Handler) *Builder {
	return &Builder{
		handler:        handler,
		port:           8080,
		enableHandlers: true,
		enableMetrics:  false,
	}
}

// WithPrometheus enables Prometheus metric collection
// from function invocation.
func (b *Builder) WithPrometheus() *Builder {
	h := b.handler
	b.handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// preprocessing
		metricOpsTotal.WithLabelValues(r.Method, r.URL.Path).Inc()
		timer := prometheus.NewTimer(metricOpsDurationHistogram)
		defer timer.ObserveDuration()
		start := time.Now()
		// call the handler
		h.ServeHTTP(w, r)
		// postprocessing
		metricOpsDurationTotal.WithLabelValues(r.Method, r.URL.Path).Add(float64(time.Since(start).Milliseconds()))
	})
	b.enableMetrics = true
	return b
}

// WithGRPC allows the server to support hybrid
// http/grpc calls
func (b *Builder) WithGRPC(srv *grpc.Server) *Builder {
	b.gsrv = srv
	return b
}

// WithHandlers toggles the use of Gorilla Handlers.
//
// Handlers are enabled by default:
//
// * RecoveryHandler - converts panics into 500 Internal Server Error
// * CombinedLoggingHandler - logging HTTP requests in a known format
func (b *Builder) WithHandlers(enabled bool) *Builder {
	b.enableHandlers = enabled
	return b
}

// WithPort sets the port that the server
// will run on.
func (b *Builder) WithPort(port int) *Builder {
	b.port = port
	return b
}

func (b *Builder) Run() {
	// setup listener
	addr := fmt.Sprintf(":%d", b.port)
	log.Printf("listening on :%d (h2c)", b.port)

	// configure HTTP
	router := http.NewServeMux()
	router.Handle("/", b.handler)
	if b.enableMetrics {
		router.Handle("/metrics", promhttp.Handler())
	}

	var h http.Handler
	dualHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// if we have a gRPC server, use it
		if b.gsrv != nil && r.ProtoMajor == 2 && strings.HasPrefix(r.Header.Get(HeaderContentType), ApplicationGRPC) {
			b.gsrv.ServeHTTP(w, r)
		} else {
			// otherwise, fallback to HTTP
			router.ServeHTTP(w, r)
		}
	})
	// wrap the h2 handler with gorilla's handlers
	if b.enableHandlers {
		h = handlers.CombinedLoggingHandler(os.Stdout, handlers.RecoveryHandler()(dualHandler))
	} else {
		h = dualHandler
	}

	srv := &http.Server{
		Addr:    addr,
		Handler: h2c.NewHandler(h, &http2.Server{}),
	}

	go func() {
		// start the server
		log.Fatal(srv.ListenAndServe())
	}()

	// wait for a signal
	sigC := make(chan os.Signal, 1)
	signal.Notify(sigC, syscall.SIGTERM, syscall.SIGINT)
	sig := <-sigC
	log.Printf("received SIGTERM/SIGINT (%s), shutting down...", sig)
}
