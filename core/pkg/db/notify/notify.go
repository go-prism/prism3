package notify

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	log "github.com/sirupsen/logrus"
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
}

func NewNotifier(db *gorm.DB, dsn string, tables ...ListenerOpts) (*Notifier, error) {
	// create the template
	tpl := template.New("trigger.sql").Funcs(template.FuncMap{"StringsJoin": strings.Join})
	tpl, err := tpl.Parse(triggerTpl)
	if err != nil {
		log.WithError(err).Error("failed to parse template")
		return nil, err
	}
	listener := make(chan *Message)
	log.Debugf("initialising notifiers for %d tables", len(tables))
	for _, table := range tables {
		log.Debugf("creating trigger on %s", table.Table)
		data := new(bytes.Buffer)
		// exec the template
		if err := tpl.Execute(data, table); err != nil {
			log.WithError(err).Error("failed to execute template")
			return nil, err
		}
		// create the trigger
		if err := db.Exec(data.String()).Error; err != nil {
			log.WithError(err).Error("failed to setup trigger")
			return nil, err
		}
		// create the listener
		_, err := NewListener(dsn, fmt.Sprintf("%s_update", table.Table), listener)
		if err != nil {
			return nil, err
		}
	}
	return &Notifier{
		lis:      map[chan *Message]struct{}{},
		listener: listener,
	}, nil
}

// Listen creates a goroutine with an infinite
// loop and waits for messages
func (n *Notifier) Listen() {
	go func() {
		for {
			msg := <-n.listener
			for k := range n.lis {
				k <- msg
			}
		}
	}()
}

func (n *Notifier) AddListener(ctx context.Context, l chan *Message) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "db_notifier_addListener")
	defer span.End()
	log.WithContext(ctx).Info("adding listener")
	n.lis[l] = struct{}{}
}

func (n *Notifier) RemoveListener(ctx context.Context, l chan *Message) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "db_notifier_removeListener")
	defer span.End()
	log.WithContext(ctx).Info("removing listener")
	delete(n.lis, l)
}
