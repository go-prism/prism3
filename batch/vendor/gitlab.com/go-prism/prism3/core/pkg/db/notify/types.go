package notify

type Message struct {
	Operation string `json:"operation"`
	ID        string `json:"id"`
	Table     string `json:"table"`
}

type ListenerOpts struct {
	Table   string
	Columns []string
}
