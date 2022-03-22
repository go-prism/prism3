package helmapi

import "errors"

var ErrNoIndexFound = errors.New("no index.yaml could be found in any remote")

type Index struct {
	publicURL string
}
