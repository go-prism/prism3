package errs

import "errors"

var (
	ErrRequestFailed = errors.New("request failed with unacceptable status code")
	ErrUnauthorised  = errors.New("unauthorised")
	ErrForbidden     = errors.New("forbidden")
)
