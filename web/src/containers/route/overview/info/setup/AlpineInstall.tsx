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

interface AlpineInstallProps {
	uri: string;
	refraction: string;
}

const AlpineInstall: React.FC<AlpineInstallProps> = ({uri, refraction}): JSX.Element => {
	const [path, pkgName, pkgVersion] = useMemo((): string[] => {
		const bits = uri.split("/");
		const name = bits[bits.length - 1];
		const [packageRevision, packageVersion, ...names] = name.replace(".apk", "").split("-").reverse().join("-").split("-");

		return [bits.slice(0, 2).join("/"), names.reverse().join("-"), `${packageVersion}-${packageRevision}`];
	}, [uri]);

	return (
		<LanguageInstall
			variants={[{
				install: <div>
					<CodeBlock
						code={`apk add ${pkgName}=${pkgVersion}`}
						language="bash"
					/>
				</div>,
				config: <div>
					<CodeBlock
						code={`echo "${API_URL}/api/-/${refraction.toLocaleLowerCase()}/${path}" >> /etc/apk/repositories\napk update`}
						language="bash"
					/>
				</div>,
				name: "Permanent"
			},
			{
				install: <div>
					<CodeBlock
						code={`apk add ${pkgName}=${pkgVersion} \\\n\t-X ${API_URL}/api/-/${refraction.toLocaleLowerCase()}/${path}`}
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
export default AlpineInstall;
