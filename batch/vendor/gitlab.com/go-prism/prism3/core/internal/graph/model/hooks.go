/*
 *    Copyright 2022 Django Cass
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

package model

import (
	"github.com/go-logr/logr"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"gorm.io/gorm"
)

type VariableVisibility interface {
	Zero()
}

func (s *RemoteSecurity) AfterFind(tx *gorm.DB) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(tx.Statement.Context, "model_remoteSecurity_afterFind")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	_, ok := client.GetContextUser(ctx)
	if !ok {
		log.V(3).Info("wiping sensitive fields for anonymous user")
		s.Zero()
	}
	return nil
}

func (s *RemoteSecurity) Zero() {
	// strip sensitive information
	s.DirectToken = ""
	s.Allowed = []string{}
	s.Blocked = []string{}
}

func (s *TransportSecurity) AfterFind(tx *gorm.DB) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(tx.Statement.Context, "model_transportSecurity_afterFind")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx)
	_, ok := client.GetContextUser(ctx)
	if !ok {
		log.V(3).Info("wiping sensitive fields for anonymous user")
		s.Zero()
		return nil
	}
	return nil
}

func (s *TransportSecurity) Zero() {
	// strip certs
	s.Cert = ""
	s.Key = ""
	s.Ca = ""
}
