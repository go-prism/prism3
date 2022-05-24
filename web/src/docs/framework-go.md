# Go

Prism provides first-class support for Go modules by providing a `GOPROXY`-compliant API.

Using it is as simple as:

```bash
export GOPROXY="https://prism.example.com/api/go"
go get github.com/sirupsen/logrus
```

## Considerations

* Go module sums are not [currently](https://gitlab.dcas.dev/prism/prism3/-/issues/38) supported.
* Go proxy does not [currently](https://gitlab.dcas.dev/prism/prism3/-/issues/39) allow configuration of Transport profiles or Remote security
* Prism bundles a copy of the Go toolchain (usually the latest stable version) so behaviour may be undefined if you do not keep your own toolchain up-to-date.