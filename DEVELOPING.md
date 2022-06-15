# Developing Prism

## Prerequisites

* Minikube or other local Kubernetes distribution
* An OIDC provider

### Create the `oidc` secret

```bash
kubectl create secret generic -n prism oidc \
	--from-literal=OIDC_CLIENT_ID=<your-oidc-client> \
	--from-literal=OIDC_CLIENT_SECRET=<your-oidc-secret> \
	--from-literal=OIDC_ISSUER_URL=https://<your-oidc-provider>
```

## Deploying components

Prism uses [Skaffold](https://skaffold.dev/) to orchestrate deployments during development.
If you're unfamiliar with Skaffold, take a moment to read through the documentation.

To deploy all components, run:

```bash
skaffold run
```

To deploy or update a specific component, run:

> Most modules depend on each other, so this should be used to deploy new changes rather than partially install Prism.

```bash
skaffold run -m <name-of-module>
```

Module names can be found in the [`skaffold.yaml`](skaffold.yaml) in the `metadata.name` field.
