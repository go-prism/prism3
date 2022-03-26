<!DOCTYPE html>
<html>
    <head>
        <meta name="pypi:repository-version" content="1.0">
        <title>Links for {{ .Package }}</title>
    </head>
    <body>
        <h1>Links for {{ .Package }}</h1>
        {{- range .Items }}
        <a href="{{ $.PublicURL }}/api/v1/{{ $.Ref }}/-/{{ .Name }}/{{ .Filename }}"{{ if .Signed }} data-gpg-sig="true"{{ end }}{{if .RequiresPython }} data-requires-python="{{ .RequiresPython }}"{{end }}>{{ .Filename }}</a><br/>
        {{- end }}
    </body>
</html>