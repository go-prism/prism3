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
import LanguageInstall from "./index";

interface Props {
	uri: string;
	refraction: string;
}

const DebianInstall: React.FC<Props> = ({uri}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("bash", bash);
	}, []);

	const [pkgName] = useMemo((): string[] => {
		const bits = uri.split("/");
		const name = bits[bits.length - 1];
		return name.split("_");
	}, [uri]);

	return (
		<LanguageInstall
			variants={[{
				install: `apt install ${pkgName}`,
				installLang: "bash",
				name: "Permanent"
			}]}
		/>
	)
}
export default DebianInstall;
