.PHONY: gql
gql:
	cd internal; go run github.com/99designs/gqlgen generate

.PHONY: run
run:
	skaffold run -f deployments/skaffold.yaml