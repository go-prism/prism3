# Helm

## Usage

```bash
helm repo add prism-helm https://prism.example.com/api/helm/<name-of-refraction>/-/
helm repo update
```

## Considerations

### Overlapping packages

When creating a Helm Refraction, keep in mind the implications of overlapping packages.

For example, the Grafana Helm repository (https://grafana.github.io/helm-charts) and the Bitnami Helm repository (https://charts.bitnami.com/bitnami) both contain a package named `grafana`.
Prism *currently* provides no guarantees as to which package you will be served.

See the [GitLab issue](https://gitlab.dcas.dev/prism/prism3/-/issues/4) tracking this problem.
