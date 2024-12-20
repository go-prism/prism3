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
}

const NpmInstall: React.FC<Props> = ({uri, refraction}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("bash", bash);
	}, []);

	const [, pkgName, pkgVersion] = useMemo((): string[] => {
		// todo handle semantic versions properly
		// e.g. lab-4.0.0-alpha.60.tgz doesn't display correctly
		const bits = uri.split("/");
		const name = bits[bits.length - 1];
		const [packageVersion, ...names] = name.replace(".tgz", "").split("-").reverse().join("-").split("-");

		return [bits.slice(0, 2).join("/"), names.reverse().join("-"), `${packageVersion}`];
	}, [uri]);

	return (
		<LanguageInstall
			variants={[{
				install: `npm install ${pkgName}@${pkgVersion}`,
				installLang: "bash",
				config: `npm config set registry "${API_URL}/api/v1/${refraction.toLocaleLowerCase()}/-/"`,
				configLang: "bash",
				name: "Permanent"
			}]}
		/>
	)
}
export default NpmInstall;
