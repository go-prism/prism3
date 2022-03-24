# Prism3

Prism3 is a rework of the Prism application designed to reduce technical debt and improve performance.

## Components

* [Core](core/README.md) - GraphQL and REST API
* [Web](web/README.md) - web dashboard

## Repository support

| Name         | Basic | Native | Notes                                         |
|--------------|-------|--------|-----------------------------------------------|
| Generic      | ✓     | ✓      |                                               |
| Maven        | ✓     | ✗      |                                               |
| NPM          | ✓     | ✓      | Doesn't support audit                         |
| Alpine       | ✓     | ✗      | Doesn't support caching the `APKINDEX.tar.gz` |
| Helm         | ✓     | ✓      | Memory issues with large repos                |
| Debian       | ✗     | ✗      |                                               |
| Rust         | ✗     | ✗      | No implementation.                            |
| Go           | ✗     | ✗      | No implementation.                            |
| Python (Pip) | ✗     | ✗      | No implementation.                            |
