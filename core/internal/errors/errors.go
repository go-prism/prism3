package errors

import "errors"

var (
	ErrUnauthorised = errors.New("unauthorised")
	ErrForbidden    = errors.New("forbidden")
)
