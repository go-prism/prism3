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


import {CacheEntry, CacheSlice, Refraction, Remote} from "@prism/prism-rpc";
import {ReactNode} from "react";
import {Icon} from "tabler-icons-react";
import {SimpleMap} from "../domain";

export type RefractionV1 = Refraction.AsObject;
export type RemoteV1 = Remote.AsObject;
export type CacheEntryV1 = CacheEntry.AsObject;
export type CacheSliceV1 = CacheSlice.AsObject;

export type Refractions = RefractionV1[];
export type Remotes = RemoteV1[];
export type CacheSlices = CacheSliceV1[];

export interface MetadataChip {
	label: ReactNode | string;
	icon: Icon;
}

export interface User {
	sub: string;
	iss: string;
	token: string;
	token_hash: string;
	claims: SimpleMap<string>;
}