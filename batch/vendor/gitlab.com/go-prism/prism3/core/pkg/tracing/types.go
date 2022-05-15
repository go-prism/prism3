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

package tracing

const (
	DefaultTracerName  = ""
	ServiceNameCore    = "prism3/core"
	ServiceNameBatch   = "prism3/batch"
	ServiceNameGoProxy = "prism3/goproxy"
)

type OtelOptions struct {
	Enabled     bool    `split_words:"true"`
	Environment string  `split_words:"true" envconfig:"GITLAB_ENVIRONMENT_NAME"`
	SampleRate  float64 `split_words:"true" default:"0.05"`
}
