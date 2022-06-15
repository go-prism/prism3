# Prism

Prism is an application designed to provide a way of caching build and development artifacts closer to your environment.

## Getting started

> Prism is still in active development. It is being consistently used in its own build process, but YMMV.

### Helm

> Make sure to view the [system requirements](https://prism.v2.dcas.dev/help/install-requirements).

The only currently supported method of installation is using the Helm chart on Kubernetes.
The chart can be found [here](charts/prism).

An example of a minimal installation values is the [`minimal.yaml`](charts/prism/ci/minimal.yaml) file.

## Features

---

* "Pass through" [authentication](https://prism.v2.dcas.dev/help/remote-settings-auth) details to the artifact backends
  * Use Prism with minimal modifications to your CI and build pipelines
* Built with limited internet access and air-gap/disconnected deployments in mind
* [Advanced firewall controls](https://prism.v2.dcas.dev/help/remote-settings-firewall)
  * Avoid leaking information about internal packages, Prism allows you to block requests from leaving its domain.
* Standing on the shoulders of giants. Prism takes advantage of industry-standard tools:
  * OpenID Connect to integrate with your organisations identity provider
  * S3 object storage to cheaply store data in your favourite Cloud or on your own hardware
  * PostgreSQL database which is offered by all major Cloud providers or can easily be hosted on-premise
* SRE-aware
  * By default, Prism only logs what's important but can be configured to log every single action it takes.
  * Enable OpenTelemetry trace exporting to find and debug errors or performance issues in Tempo, Jaeger or your favourite tracing tool.
* Dark theme!

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
