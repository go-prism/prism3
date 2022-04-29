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
	"encoding/json"
	"github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"time"
)

type Listener struct {
	channelName string
	listener    *pq.Listener
	failed      chan error
	handler     chan *Message
}

func NewListener(dsn, channelName string, handler chan *Message) (*Listener, error) {
	n := new(Listener)
	log.Infof("opening listener: %s", channelName)
	listener := pq.NewListener(dsn, time.Second, time.Minute, n.logListener)
	if err := listener.Listen(channelName); err != nil {
		log.WithError(listener.Close()).Debug("closing listener")
		log.WithError(err).Error("failed to listen")
		return nil, err
	}

	n.channelName = channelName
	n.listener = listener
	n.failed = make(chan error, 2)
	n.handler = handler

	// start the event loop in the background
	go func() {
		for {
			_ = n.notify()
		}
	}()

	return n, nil
}

func (n *Listener) logListener(event pq.ListenerEventType, err error) {
	if err != nil {
		log.WithError(err).Errorf("listener error: %s", n.channelName)
	}
	if event == pq.ListenerEventConnectionAttemptFailed {
		n.failed <- err
	}
}

func (n *Listener) notify() error {
	var fetchCounter uint64
	for {
		select {
		case e := <-n.listener.Notify:
			if e == nil {
				continue
			}
			fetchCounter++
			log.Debugf("message %d: %s", fetchCounter, e.Extra)
			msg, err := n.parseMessage(e.Extra)
			if err != nil {
				continue
			}
			n.handler <- msg
		case err := <-n.failed:
			return err
		case <-time.After(time.Minute):
			go log.WithError(n.listener.Ping()).Debugf("pinging listener: %s", n.channelName)
		}
	}
}

func (n *Listener) parseMessage(data string) (*Message, error) {
	var message Message
	if err := json.Unmarshal([]byte(data), &message); err != nil {
		log.WithError(err).Errorf("failed to parse message: %s", data)
		return nil, err
	}
	return &message, nil
}

func (n *Listener) Close() error {
	close(n.failed)
	return n.listener.Close()
}
