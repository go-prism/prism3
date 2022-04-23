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

import React, {useLayoutEffect, useMemo} from "react";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import {API_URL} from "../../../../../config";
import LanguageInstall from "./index";

interface HelmInstallProps {
	uri: string;
	refraction: string;
}

const HelmInstall: React.FC<HelmInstallProps> = ({uri, refraction}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("bash", bash);
	}, []);

	const [pkgName, pkgVersion] = useMemo(() => {
		const bits = uri.split("/").filter(i => i !== "");
		if (bits.length === 0)
			return ["", ""];
		const filename = bits[bits.length - 1].replace(".tgz", "");
		const del = filename.lastIndexOf("-");
		return [filename.substring(0, del), filename.substring(del + 1, filename.length)];
	}, [uri]);

	return (
		<LanguageInstall
			variants={[{
				install: `helm install my-app prism-helm/${pkgName} --version=${pkgVersion}`,
				installLang: "bash",
				config: `helm repo add prism-helm ${API_URL}/api/helm/${refraction}/-/\nhelm repo update`,
				configLang: "bash",
				name: "Permanent"
			},
			{
				install: `helm install my-app ${API_URL}/api/v1/${refraction}/-/${pkgName}-${pkgVersion}.tgz`,
				installLang: "bash",
				name: "Temporary"
			}]}
		/>
	)
}
export default HelmInstall;
