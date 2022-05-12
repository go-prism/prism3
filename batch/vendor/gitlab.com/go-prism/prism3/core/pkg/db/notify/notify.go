package notify

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"gorm.io/gorm"
	"strings"
	"text/template"
)

//go:embed trigger.sql
var triggerTpl string

type Notifier struct {
	lis      map[chan *Message]struct{}
	listener chan *Message
	log      logr.Logger
}

func NewNotifier(ctx context.Context, db *gorm.DB, dsn string, tables ...ListenerOpts) (*Notifier, error) {
	log := logr.FromContextOrDiscard(ctx)
	// create the template
	tpl := template.New("trigger.sql").Funcs(template.FuncMap{"StringsJoin": strings.Join})
	tpl, err := tpl.Parse(triggerTpl)
	if err != nil {
		log.Error(err, "failed to parse template")
		return nil, err
	}
	listener := make(chan *Message)
	log.V(1).Info("initialising notifiers for tables", "Count", len(tables))
	for _, table := range tables {
		log = log.WithValues("Table", table)
		log.V(1).Info("creating trigger")
		data := new(bytes.Buffer)
		// exec the template
		log.V(2).Info("creating template")
		if err := tpl.Execute(data, table); err != nil {
			log.Error(err, "failed to execute template")
			return nil, err
		}
		// create the trigger
		log.V(2).Info("creating trigger")
		if err := db.Exec(data.String()).Error; err != nil {
			log.Error(err, "failed to setup trigger")
			return nil, err
		}
		// create the listener
		log.V(2).Info("creating listener")
		_, err := NewListener(ctx, dsn, fmt.Sprintf("%s_update", table.Table), listener)
		if err != nil {
			return nil, err
		}
	}
	return &Notifier{
		lis:      map[chan *Message]struct{}{},
		listener: listener,
		log:      log,
	}, nil
}

// Listen creates a goroutine with an infinite
// loop and waits for messages
func (n *Notifier) Listen() {
	log := n.log
	go func() {
		for {
			log.V(2).Info("waiting for message from listener")
			msg := <-n.listener
			log.V(2).Info("broadcasting message to listeners", "Count", len(n.lis))
			for k := range n.lis {
				k <- msg
			}
		}
	}()
}

func (n *Notifier) AddListener(ctx context.Context, l chan *Message) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "db_notifier_addListener")
	defer span.End()
	logr.FromContextOrDiscard(ctx).V(1).Info("adding listener")
	n.lis[l] = struct{}{}
}

func (n *Notifier) RemoveListener(ctx context.Context, l chan *Message) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "db_notifier_removeListener")
	defer span.End()
	logr.FromContextOrDiscard(ctx).V(1).Info("removing listener")
	delete(n.lis, l)
}
