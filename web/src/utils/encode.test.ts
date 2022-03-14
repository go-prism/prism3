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

import {base64Decode, base64Encode, unescapeString} from "./encode";

// https://cs.opensource.google/go/x/mod/+/master:module/module_test.go;l=247
describe("go encoding tests", () => {
	it("ignores valid input", () => {
		const str = "ascii.com/abcdefghijklmnopqrstuvwxyz.-/~_0123456789";
		expect(unescapeString(str)).toEqual(str);
	});
	it("unescapes escaped data", () => {
		const str = "github.com/!google!cloud!platform/omega";
		const expected = "github.com/GoogleCloudPlatform/omega";
		expect(unescapeString(str)).toEqual(expected);
	});
});


describe("base64 encoding", () => {
	it("reverses encoding correctly", () => {
		const str = "th1s is 5oM3 text!";
		expect(base64Decode(base64Encode(str))).toEqual(str);
	});
});