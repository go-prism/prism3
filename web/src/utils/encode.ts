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

/**
 * Creates a base64 encoded ASCII string
 * @param data
 */
export const base64Encode = (data: string): string => {
	return btoa(unescape(encodeURIComponent(data)));
}

/**
 * Returns a base64 encoded ASCII string
 * to its original form
 * @param data
 */
export const base64Decode = (data: string): string => {
	return decodeURIComponent(escape(atob(data)));
}

/**
 * Unescapes a Go module path as
 * dictated by https://cs.opensource.google/go/x/mod/+/master:module/module.go;l=769
 * @param escaped
 */
export const unescapeString = (escaped: string): string => {
	let buf = "";
	let bang = false;
	for (let c of escaped) {
		if (bang) {
			bang = false;
			buf = buf + c.toLocaleUpperCase();
			continue
		}
		if (c === "!") {
			bang = true;
			continue
		}
		buf = buf + c;
	}
	return buf;
}
