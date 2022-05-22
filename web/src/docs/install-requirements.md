# Prism installation requirements

This page contains information about the resources that are needed in order to install Prism.

## Hardware requirements

### Storage

Prism stores data in its database and artifacts in an object store.

#### Object storage

| Provider                             | Type | Supported |
|--------------------------------------|------|-----------|
| [Amazon](https://aws.amazon.com/s3/) | S3   | Yes       |
| [Minio](https://min.io/)             | S3   | Yes       |

Prism currently only supports Amazon S3.
This includes other provides that implement the S3 API (e.g. Minio).

The amount of data used by Prism depends on the size and types of artifacts that you intend on retrieving.
Artifacts such as Maven packages are usually quite small, so you will likely only need a few Gigabytes.

To be safe, allocate a decent chunk (e.g. 50GiB) to ensure you have plenty of space for the future.

### CPU

### Memory

Memory requirements depend on the expected workload. Safe starting values for each component are:

| Component         | Memory |
|-------------------|--------|
| Batch<sup>1</sup> | 0.5GiB |
| Core              | 0.5GiB |
| GoProxy           | 250MiB |
| Web               | 50MiB  |

1. If you are using a lot of Helm charts, you should increase the memory available to the Batch service.

Keep in mind that services can also be scaled horizontally.

### Database

Prism only supports PostgreSQL (though YMMV with other PostgreSQL-compliant databases such as CockroachDB). 
Prism stores a lot of metadata, so allocate at least 10Gib to avoid storage issues down the line.