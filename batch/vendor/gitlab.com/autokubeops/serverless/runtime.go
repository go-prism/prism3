package serverless

import (
	"fmt"
	"github.com/go-logr/logr"
	"github.com/go-logr/stdr"
	"github.com/gorilla/handlers"
	_ "go.uber.org/automaxprocs"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
	stdlog "log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

const (
	HeaderContentType = "Content-Type"
	ApplicationGRPC   = "application/grpc"
)

type Builder struct {
	handler        http.Handler
	gsrv           *grpc.Server
	port           int
	log            logr.Logger
	enableHandlers bool
}

func NewBuilder(handler http.Handler) *Builder {
	return &Builder{
		handler:        handler,
		port:           8080,
		enableHandlers: true,
		log:            stdr.New(stdlog.New(os.Stdout, "", stdlog.LstdFlags)).WithName("serverless"),
	}
}

// WithLogger configures the logging implementation that
// is used.
//
// Defaults to https://github.com/go-logr/stdr if
// this function is not called.
func (b *Builder) WithLogger(log logr.Logger) *Builder {
	b.log = log.WithName("serverless")
	b.log.V(2).Info("building logger")
	return b
}

// WithPrometheus enables Prometheus metric collection
// from function invocation.
//
// Deprecated
func (b *Builder) WithPrometheus() *Builder {
	b.log.Info("prometheus metrics collection has been removed due to interference with other collectors")
	return b
}

// WithGRPC allows the server to support hybrid
// http/grpc calls
func (b *Builder) WithGRPC(srv *grpc.Server) *Builder {
	b.log.V(2).Info("building gRPC")
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
	b.log.V(2).Info("configuring handlers", "Enabled", enabled)
	b.enableHandlers = enabled
	return b
}

// WithPort sets the port that the server
// will run on.
func (b *Builder) WithPort(port int) *Builder {
	b.log.V(2).Info("configuring port", "Port", port)
	b.port = port
	return b
}

func (b *Builder) Run() {
	log := b.log
	// setup listener
	addr := fmt.Sprintf(":%d", b.port)
	log.V(1).Info("starting h2c server", "Interface", addr)

	// configure HTTP
	router := http.NewServeMux()
	router.Handle("/", b.handler)

	var h http.Handler
	dualHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.V(6).Info("attempting to determine request type", "ProtoMajor", r.ProtoMajor, "ContentType", r.Header.Get(HeaderContentType))
		// if we have a gRPC server, use it
		if b.gsrv != nil && r.ProtoMajor == 2 && strings.HasPrefix(r.Header.Get(HeaderContentType), ApplicationGRPC) {
			log.V(5).Info("detected gRPC")
			b.gsrv.ServeHTTP(w, r)
		} else {
			// otherwise, fallback to HTTP
			log.V(5).Info("unable to detect gRPC request, defaulting to HTTP")
			router.ServeHTTP(w, r)
		}
	})
	// wrap the h2 handler with gorilla's handlers
	if b.enableHandlers {
		log.V(4).Info("enabling panic recovery handler")
		h = handlers.RecoveryHandler()(dualHandler)
	} else {
		h = dualHandler
	}
	h = loggingMiddleware(log)(h)

	srv := &http.Server{
		Addr:    addr,
		Handler: h2c.NewHandler(h, &http2.Server{}),
	}

	go func() {
		// start the server
		if err := srv.ListenAndServe(); err != nil {
			log.Error(err, "server exited with error")
			os.Exit(1)
		}
	}()

	// wait for a signal
	sigC := make(chan os.Signal, 1)
	signal.Notify(sigC, syscall.SIGTERM, syscall.SIGINT)
	sig := <-sigC
	log.Info("received SIGTERM/SIGINT (%s), shutting down...", "Signal", sig)
}
