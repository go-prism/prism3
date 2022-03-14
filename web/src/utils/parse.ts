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

export interface MavenPackage {
	artifactId: string;
	groupId: string;
	version: string;
}

/**
 * Attempts to extract maven metadata from a given pathname
 * @param path
 */
export const parseMavenPackage = (path: string): MavenPackage | null => {
	const parts = path.split("/");
	parts.pop(); // remove the filename
	const version = parts.pop();
	if (version == null) {
		return null;
	}
	const artifact = parts.pop();
	if (artifact == null) {
		return null;
	}
	const group = parts.join(".");
	return {
		artifactId: artifact,
		groupId: group,
		version: version
	};
}

export const parseUsername = (username: string): string => {
	const [iss, sub] = username.split("/");
	if (sub == null)
		return parseDN(iss);
	return parseDN(sub);
}

export const parseDN = (dn: string): string => {
	const bits = dn.split(",");
	for (let i = 0; i < bits.length; i++) {
		const b = bits[i];
		if (b.trimStart().startsWith("CN=")) {
			return b.replace("CN=", "");
		}
	}
	return dn;
}

export const getInitials = (name: string): string => {
	return name.split(" ").map(w => w.length > 0 ? w[0] : "").join("");
}
