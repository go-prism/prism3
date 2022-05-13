/*
 *    Copyright 2021 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package notify

import (
	"context"
	"encoding/json"
	"github.com/go-logr/logr"
	"github.com/lib/pq"
	"time"
)

type Listener struct {
	channelName string
	listener    *pq.Listener
	failed      chan error
	handler     chan *Message
	log         logr.Logger
}

func NewListener(ctx context.Context, dsn, channelName string, handler chan *Message) (*Listener, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("database_listener").WithValues("Channel", channelName)
	n := new(Listener)
	n.log = log
	log.Info("opening listener")
	log.V(2).Info("establishing connection via listener", "DSN", dsn, "MinInterval", time.Second, "MaxInterval", time.Minute)
	listener := pq.NewListener(dsn, time.Second, time.Minute, n.logListener)
	if err := listener.Listen(channelName); err != nil {
		log.V(1).Error(listener.Close(), "closing listener")
		log.Error(err, "failed to listen")
		return nil, err
	}

	n.channelName = channelName
	n.listener = listener
	n.failed = make(chan error, 2)
	n.handler = handler

	// start the event loop in the background
	go func() {
		for {
			log.V(3).Info("waiting for message from listener")
			_ = n.notify()
		}
	}()

	return n, nil
}

func (n *Listener) logListener(event pq.ListenerEventType, err error) {
	if err != nil {
		n.log.Error(err, "listener error")
	}
	if event == pq.ListenerEventConnectionAttemptFailed {
		n.failed <- err
	}
}

func (n *Listener) notify() error {
	log := n.log
	var fetchCounter uint64
	for {
		select {
		case e := <-n.listener.Notify:
			if e == nil {
				log.V(1).Info("skipping nil message")
				continue
			}
			fetchCounter++
			log.V(2).Info("received message from listener", "Count", fetchCounter, "Message", e.Extra, "Pid", e.BePid)
			msg, err := n.parseMessage(e.Extra)
			if err != nil {
				continue
			}
			n.handler <- msg
		case err := <-n.failed:
			log.V(1).Error(err, "received error from listener")
			return err
		case <-time.After(time.Minute):
			go func() {
				log.V(2).Info("pinging listener")
				if err := n.listener.Ping(); err != nil {
					log.V(1).Error(err, "failed to ping listener")
				}
			}()
		}
	}
}

func (n *Listener) parseMessage(data string) (*Message, error) {
	log := n.log
	log.V(2).Info("attempting to parse message", "Message", data)
	var message Message
	if err := json.Unmarshal([]byte(data), &message); err != nil {
		log.Error(err, "failed to parse message")
		return nil, err
	}
	return &message, nil
}

func (n *Listener) Close() error {
	n.log.V(2).Info("closing listener")
	close(n.failed)
	return n.listener.Close()
}
