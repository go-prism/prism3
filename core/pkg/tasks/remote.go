package tasks

const (
	TypeIndexRemote    = "index@remote"
	TypeIndexRemoteAll = "index@remote-all"
)

type IndexRemotePayload struct {
	RemoteID string
}

type IndexRemoteAllPayload struct{}
