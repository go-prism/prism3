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
import {API_URL} from "../../../../../config";
import LanguageInstall from "./index";

interface Props {
	uri: string;
	refraction: string;
}

const GenericInstall: React.FC<Props> = ({uri, refraction}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("bash", bash);
	}, []);

	return (
		<LanguageInstall
			variants={[{
				install: <div>
					<CodeBlock
						code={`curl -O "${API_URL}/api/v1/${refraction.toLocaleLowerCase()}/-${uri}"`}
						language="bash"
					/>
				</div>,
				name: "cURL"
			},
			{
				install: <div>
					<CodeBlock
						code={`wget "${API_URL}/api/v1/${refraction.toLocaleLowerCase()}/-${uri}"`}
						language="bash"
					/>
				</div>,
				name: "wget"
			}]}
		/>
	)
}
export default GenericInstall;
