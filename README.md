# Prism3

Prism3 is a rework of the Prism application designed to reduce technical debt and improve performance.

## Components

* [Core](core/README.md) - GraphQL and REST API
* [GoProxy](goproxy/README.md) - Plugin to enable the Go archetype
* [Web](web/README.md) - web dashboard

## Repository support

| Name         | Basic | Native | Offline | Notes                                                                 |
|--------------|-------|--------|---------|-----------------------------------------------------------------------|
| Generic      | ✓     | ✓      | ✓       |                                                                       |
| Maven        | ✓     | ✗      | ✓       |                                                                       |
| NPM          | ✓     | ✓      | ✗       | Doesn't support audit                                                 |
| Alpine       | ✓     | ✗      | ✗       | Doesn't support caching the `APKINDEX.tar.gz`                         |
| Helm         | ✓     | ✓      | ✗       | Memory issues with large repos                                        |
| Debian       | ✗     | ✗      | ✗       |                                                                       |
| Rust         | ✗     | ✗      | ✗       | No implementation.                                                    |
| Go           | ✗     | ✓      | ✓       | Requires special plugin. Works outside of standard Remote/Refractions |
| Python (Pip) | ✓     | ✓      | ✗       |                                                                       |
