package tasks

const (
	TypeHelmRepository = "pkg@helm:repository"
)

type HelmRepositoryPayload struct {
	RemoteID string
}
