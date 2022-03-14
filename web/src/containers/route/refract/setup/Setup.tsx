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


import React, {useMemo} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {RefractionV1} from "../../../../config/types";
import {API_URL} from "../../../../config";
import Error from "../../../alert/Error";
import {ARCH_ALPINE, ARCH_DEBIAN, ARCH_GO, ARCH_HELM, ARCH_MAVEN, ARCH_NODE} from "../../../../config/constants";

interface SetupProps {
	refract: RefractionV1;
}

const Setup: React.FC<SetupProps> = ({refract}): JSX.Element => {
	// local state
	const language = useMemo(() => {
		switch (refract.archetype) {
			case ARCH_MAVEN:
				return "xml";
			case ARCH_HELM:
			case ARCH_GO:
			case ARCH_ALPINE:
			case ARCH_DEBIAN:
				return "shell";
			default:
				return "text";
		}
	}, [refract]);

	const text = useMemo(() => {
		const url = `${API_URL}/api/-/${refract.name.toLocaleLowerCase()}`;
		switch(refract.archetype) {
			case ARCH_MAVEN:
				return `<settings xmlns="https://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="https://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">
        <localRepository/>
        <interactiveMode/>
        <offline/>
        <pluginGroups/>
        <servers/>
        <mirrors>
                <mirror>
                        <id>prism</id>
                        <name>Prism</name>
                        <url>${url}</url>
                        <mirrorOf>*</mirrorOf>
                </mirror>
        </mirrors>
        <proxies/>
        <profiles/>
        <activeProfiles/>
</settings>`;
			case ARCH_GO:
				return `# use Prism as a module proxy
export GOPROXY="${API_URL}/api/plugin/-/mod/-/"`;
			case ARCH_NODE:
				return `# automatically using the npm cli
npm config set registry "${url}"
# manually
echo "registry=${url}" >> ~/.npmrc`;
			case ARCH_ALPINE:
				return `# replace "latest-stable" with the target version (e.g. 3.12, 3.12)
# replace "main" with the target repository (e.g. main, community, edge)
#
# to use Prism and original repositories
echo "${url}/latest-stable/main" >> /etc/apk/repositories
# to use only Prism
echo "${url}/latest-stable/main" > /etc/apk/repositories
#
# to use Prism without changing existing repositories
apk add somepackage \\
	-X ${url}/latest-stable/main \\
	-X ${url}/latest-stable/community`;
			case ARCH_DEBIAN:
				return `# replace "buster" with the target distribution (e.g. buster, jessie, stretch)
# replace "main" with the target components (e.g. main, security)
#
# to use Prism and original repositories
echo "deb ${url} buster main" >> /etc/apt/sources.list
# to use only Prism
echo "deb ${url} buster main" > /etc/apt/sources.list`;
			case ARCH_HELM:
				return `helm repo add prism-${refract.name.toLocaleLowerCase()} ${url}
helm repo update`;
			default:
				return `curl ${url}/path/to/file.txt > file.txt`;
		}
	}, [refract]);

	return (
		<div>
			<ErrorBoundary
				fallbackRender={p => <Error props={p}/>}>
				{/*<CopyBlock*/}
				{/*	text={text}*/}
				{/*	language={language}*/}
				{/*	showLineNumbers*/}
				{/*	theme={dracula}*/}
				{/*	codeBlock*/}
				{/*/>*/}
			</ErrorBoundary>
		</div>
	);
}
export default Setup;
