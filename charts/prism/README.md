# Prism

## TL;DR:

```shell
helm repo add prism https://todo

helm install prism prism/prism \
	--set url=https://prism.example.com
```

## Introduction

This chart bootstraps a Prism deployment on a [Kubernetes](http://kubernetes.io/) cluster using the [Helm](https://helm.sh/) package manager.

## Prerequisites

* Helm 3+
* Kubernetes 1.19
