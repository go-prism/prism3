# Serverless

This project provides Serverless runtimes for use with Knative.

## Runtimes

* Go


### Go

The Go runtime reserves the following HTTP paths:
* `/metrics` for Prometheus Metrics *(if enabled)*

Usage:

```go
package main

import (
	"gitlab.com/autokubeops/serverless"
	"net/http"
)

func main() {
	serverless.NewBuilder(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// put your application logic here
		_, _ = w.Write([]byte("OK"))
	})).
		WithPrometheus(). // enable prometheus metrics (optional)
		Run()
}
```

#### GRPC

The Go runtime supports dual HTTP/gRPC servers.
It can be configured by calling the `WithGRPC` function when building the serverless function.


Example:

```go
package main

import (
	"gitlab.com/autokubeops/serverless"
	"google.golang.org/grpc"
	"net/http"
)

func main() {
	// todo register your gRPC servers
	srv := grpc.NewServer()
	serverless.NewBuilder(http.NotFoundHandler()).
		WithGRPC(srv).
		Run()
}
```
