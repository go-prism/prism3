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

import {Archetype} from "../generated/graphql";
import {SimpleMap} from "../domain";


export const REMOTE_ARCHETYPES: {name: string, value: Archetype, stable: boolean}[] = [
	{name: "Generic", value: Archetype.Generic, stable: true},
	{name: "Maven", value: Archetype.Maven, stable: true},
	{name: "NPM", value: Archetype.Npm, stable: true},
	{name: "Alpine", value: Archetype.Alpine, stable: true},
	{name: "Helm", value: Archetype.Helm, stable: true},
	{name: "Debian", value: Archetype.Debian, stable: false},
	{name: "PyPI", value: Archetype.Pip, stable: true}
];

export const ARCHETYPE_SAMPLES: SimpleMap<string> = {
	[Archetype.Generic]: "https://github.com",
	[Archetype.Alpine]: "https://alpine.global.ssl.fastly.net/alpine",
	[Archetype.Debian]: "https://deb.debian.org/debian",
	[Archetype.Helm]: "https://charts.bitnami.com/bitnami",
	[Archetype.Maven]: "https://repo1.maven.org/maven2",
	[Archetype.Npm]: "https://registry.npmjs.org",
	[Archetype.Pip]: "https://pypi.org/simple"
};

export const PREF_DARK_THEME = "dark-theme";
export const PREF_FMT_DATE_ABS = "fmt-date-abs";
export const PREF_VIEW_ARTIFACT_LIST = "view-artifact-list";

export const RESOURCE_REFRACT = "refraction";
export const RESOURCE_REMOTE = "remote";
export const RESOURCE_TRANSPORT = "transport";
