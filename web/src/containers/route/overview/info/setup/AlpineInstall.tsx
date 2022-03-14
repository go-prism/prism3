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
import {Card} from "@material-ui/core";
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
				install: <Card
					variant="outlined">
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={`apk add ${pkgName}=${pkgVersion}`}*/}
					{/*	language="bash"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</Card>,
				config: <Card
					variant="outlined">
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={`echo "${API_URL}/api/-/${refraction.toLocaleLowerCase()}/${path}" >> /etc/apk/repositories\napk update`}*/}
					{/*	language="bash"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</Card>,
				name: "Permanent"
			},
			{
				install: <Card
					variant="outlined">
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={`apk add ${pkgName}=${pkgVersion} \\\n\t-X ${API_URL}/api/-/${refraction.toLocaleLowerCase()}/${path}`}*/}
					{/*	language="bash"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</Card>,
				config: <Card
					variant="outlined">
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text="N/A"*/}
					{/*	language="bash"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</Card>,
				name: "Temporary"
			}]}
		/>
	)
}
export default AlpineInstall;
