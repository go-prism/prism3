package schemas

import "gitlab.com/go-prism/prism3/core/pkg/httpclient"

const (
	TableNameStoredUsers = "stored_users"
)

type RequestContext struct {
	httpclient.AuthOpts
	PartitionID string
}
