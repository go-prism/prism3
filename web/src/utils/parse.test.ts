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

import {MavenPackage, parseMavenPackage, parseUsername} from "./parse";

describe("maven parsing", () => {
	it("should extract the correct information", () => {
		const expected: MavenPackage = {
			version: "2.4.4",
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-actuator"
		}
		expect(parseMavenPackage("org/springframework/boot/spring-boot-actuator/2.4.4/spring-boot-actuator-2.4.4.jar")).toEqual(expected);
	});
});

describe("username parsing", () => {
	it("should extract PKI information", () => {
		const username = "CN=Test Issuer/CN=Test User,OU=Foo";
		const name = parseUsername(username);
		expect(name).toEqual("Test User");
	});
	it("should handle OIDC ids", () => {
		const username = "https://gitlab.com/123456";
		const name = parseUsername(username);
		expect(name).toEqual("123456");
	});
});
