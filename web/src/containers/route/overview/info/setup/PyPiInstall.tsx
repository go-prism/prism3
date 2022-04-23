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

interface Props {
	uri: string;
	refraction: string;
	wheel: boolean;
}

const PyPiInstall: React.FC<Props> = ({uri, refraction, wheel}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("bash", bash);
	}, []);

	const [pkgName, pkgVersion] = useMemo((): string[] => {
		// todo handle semantic versions properly
		// e.g. lab-4.0.0-alpha.60.tgz doesn't display correctly
		const bits = uri.split("/");
		const name = bits[bits.length - 1];
		if (!wheel) {
			const [packageVersion, ...names] = name.replace(".tar.gz", "").split("-").reverse().join("-").split("-");
			return [names.reverse().join("-"), `${packageVersion}`];
		}
		return name.split("-");
	}, [uri]);

	return (
		<LanguageInstall
			variants={[{
				install: `pip install ${pkgName}==${pkgVersion}`,
				installLang: "bash",
				config: `pip config --user set global.index-url ${API_URL}/api/pypi/${refraction.toLocaleLowerCase()}/simple/
pip config --user set global.trusted-host ${API_URL.replace("https://", "")}`,
				configLang: "bash",
				name: "Permanent"
			}, {
				install: `pip install ${pkgName}==${pkgVersion} --index-url ${API_URL}/api/pypi/${refraction.toLocaleLowerCase()}/simple/`,
				installLang: "bash",
				name: "Temporary"
			}]}
		/>
	)
}
export default PyPiInstall;
