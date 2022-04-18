.PHONY: gql
gql:
	cd core; go generate ./...
	cd web; npm run gql
