package schemas

import "gitlab.com/go-prism/prism3/core/pkg/httpclient"

type RequestContext struct {
	httpclient.AuthOpts
	PartitionID string
}

func (r *RequestContext) Clone() *RequestContext {
	return &RequestContext{
		AuthOpts: httpclient.AuthOpts{
			Mode:   r.Mode,
			Header: r.Header,
			Token:  r.Token,
		},
		PartitionID: r.PartitionID,
	}
}
