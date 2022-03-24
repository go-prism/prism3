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
import CodeBlock from "../../../../widgets/CodeBlock";
import {API_URL} from "../../../../../config";
import LanguageInstall from "./index";

interface HelmInstallProps {
	uri: string;
	refraction: string;
}

const HelmInstall: React.FC<HelmInstallProps> = ({uri, refraction}): JSX.Element => {
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
				install: <div>
					<CodeBlock
						code={`helm install my-app prism-helm/${pkgName} --version=${pkgVersion}`}
						language="bash"
					/>
				</div>,
				config: <div>
					<CodeBlock
						code={`helm repo add prism-helm ${API_URL}/api/helm/${refraction}/-/\nhelm repo update`}
						language="bash"
					/>
				</div>,
				name: "Permanent"
			},
			{
				install: <div>
					<CodeBlock
						code={`helm install my-app ${API_URL}/api/-/${refraction}/${pkgName}-${pkgVersion}.tgz`}
						language="bash"
					/>
				</div>,
				config: <div>
					<CodeBlock
						code="N/A"
						language="bash"
					/>
				</div>,
				name: "Temporary"
			}]}
		/>
	)
}
export default HelmInstall;
