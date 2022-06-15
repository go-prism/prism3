# Prism

Prism is an application designed to provide a way of caching build and development artifacts closer to your environment.

## Getting started

> Prism is still in active development. It is being consistently used in its own build process, but YMMV.

### Helm

The only currently supported method of installation is using the Helm chart on Kubernetes.
The chart can be found [here](charts/prism).

An example of a minimal installation values is the [`minimal.yaml`](charts/prism/ci/minimal.yaml) file.

## Features

---

* "Pass through" authentication details to the artifact backends
  * Use Prism with minimal modifications to your CI and build pipelines
* Built with limited internet access and air-gapped/disconnected deployments in mind

## Repository support

| Name         | Basic | Native | Offline | Notes                                                                  |
|--------------|-------|--------|---------|------------------------------------------------------------------------|
| Generic      | ✓     | ✓      | ✓       |                                                                        |
| Maven        | ✓     | ✗      | ✓       |                                                                        |
| NPM          | ✓     | ✓      | ✗       | Doesn't support audit.                                                 |
| Alpine       | ✓     | ✗      | ✗       | Doesn't support caching the `APKINDEX.tar.gz`.                         |
| Helm         | ✓     | ✓      | ✓       |                                                                        |
| Debian       | ✗     | ✗      | ✗       | In progress.                                                           |
| Rust         | ✗     | ✗      | ✗       | Planned.                                                               |
| Dnf/Yum      | ✗     | ✗      | ✗       | Planned.                                                               |
| Go           | ✗     | ✓      | ✓       | Requires special plugin. Works outside of standard Remote/Refractions. |
| Python (Pip) | ✓     | ✓      | ✗       |                                                                        |
