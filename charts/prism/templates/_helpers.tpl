{{/*
Expand the name of the chart.
*/}}
{{- define "prism.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "prism.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*OIDC secret name*/}}
{{- define "prism.oidcSecretName" }}
{{- $name := include "prism.coreName" . }}
{{- .Values.oidc.existingSecret | default (printf "%s-oidc" $name) }}
{{- end }}

{{/*Core name*/}}
{{- define "prism.coreName" }}
{{- $name := include "prism.fullname" . }}
{{- printf "%s-core" $name }}
{{- end }}

{{/*Goproxy name*/}}
{{- define "prism.goproxyName" }}
{{- $name := include "prism.fullname" . }}
{{- printf "%s-goproxy" $name }}
{{- end }}

{{/*Batch name*/}}
{{- define "prism.batchName" }}
{{- $name := include "prism.fullname" . }}
{{- printf "%s-batch" $name }}
{{- end }}

{{/*Web name*/}}
{{- define "prism.webName" }}
{{- $name := include "prism.fullname" . }}
{{- printf "%s-web" $name }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "prism.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "prism.labels" -}}
helm.sh/chart: {{ include "prism.chart" . }}
{{ include "prism.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Core labels
*/}}
{{- define "prism.coreLabels" -}}
helm.sh/chart: {{ include "prism.chart" . }}
{{ include "prism.coreSelectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Goproxy labels
*/}}
{{- define "prism.goproxyLabels" -}}
helm.sh/chart: {{ include "prism.chart" . }}
{{ include "prism.goproxySelectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Batch labels
*/}}
{{- define "prism.batchLabels" -}}
helm.sh/chart: {{ include "prism.chart" . }}
{{ include "prism.batchSelectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Web labels
*/}}
{{- define "prism.webLabels" -}}
helm.sh/chart: {{ include "prism.chart" . }}
{{ include "prism.webSelectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "prism.selectorLabels" -}}
app.kubernetes.io/name: {{ include "prism.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Core selector labels
*/}}
{{- define "prism.coreSelectorLabels" -}}
{{ include "prism.selectorLabels" . }}
app.kubernetes.io/component: core
{{- end }}

{{/*
Goproxy selector labels
*/}}
{{- define "prism.goproxySelectorLabels" -}}
{{ include "prism.selectorLabels" . }}
app.kubernetes.io/component: goproxy
{{- end }}

{{/*
Batch selector labels
*/}}
{{- define "prism.batchSelectorLabels" -}}
{{ include "prism.selectorLabels" . }}
app.kubernetes.io/component: batch
{{- end }}

{{/*
Web selector labels
*/}}
{{- define "prism.webSelectorLabels" -}}
{{ include "prism.selectorLabels" . }}
app.kubernetes.io/component: web
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "prism.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "prism.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the PostgreSQL DSN
*/}}
{{- define "prism.primaryDSN" -}}
{{- if not .Values.db.dsn.primary }}
{{- printf "user=%s password=%s dbname=%s port=5432 sslmode=disable host=%s-postgresql" .Values.global.postgresql.auth.username .Values.global.postgresql.auth.password .Values.global.postgresql.auth.database .Release.Name }}
{{- else }}
{{- printf "%s" .Values.db.dsn.primary }}
{{- end }}
{{- end }}
