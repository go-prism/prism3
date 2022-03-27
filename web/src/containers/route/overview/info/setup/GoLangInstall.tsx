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

import React, {useLayoutEffect} from "react";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import CodeBlock from "../../../../widgets/CodeBlock";
import {unescapeString} from "../../../../../utils/encode";
import {API_URL} from "../../../../../config";
import LanguageInstall from "./index";

interface GoLangInstallProps {
	uri: string;
}

const GoLangInstall: React.FC<GoLangInstallProps> = ({uri}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("bash", bash);
	}, []);

	return (
		<LanguageInstall
			variants={[{
				install: <div>
					<CodeBlock
						code={`go get -d ${unescapeString(uri.replace("/@v/", "@").replace(".mod", "").replace(".info", ""))}`}
						language="bash"
					/>
				</div>,
				config: <div>
					<CodeBlock
						code={`echo 'export GOPROXY="${API_URL}/api/plugin/-/mod/-/"' >> ~/.bashrc
					source ~/.bashrc`}
						language="bash"
					/>
				</div>,
				name: "Go Modules"
			}]}
		/>
	)
}
export default GoLangInstall;
