# Installation

Prism can be installed in a number of ways, however the out-of-the-box methods are all targeting a Kubernetes-based deployment.

## Requirements

Before installing, make sure to review the [system requirements](install-requirements).

## Choose an installation

| Installation method | Description                                                                                                                                    |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Helm charts         | The Cloud-native Helm chart installs Prism and all its components on Kubernetes. This is the recommended and supported method of installation. |
| Docker              | As the Prism components are all packages as containers, they can be run in Docker or any other OCI-compliant orchestrator (e.g. Nomad).        |
| Source              | Compile the components manually and install them however you desire.                                                                           |