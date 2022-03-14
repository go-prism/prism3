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

import React from "react";
import {Card} from "@material-ui/core";
import LanguageInstall from "./index";

interface GoLangInstallProps {
	uri: string;
}

const GoLangInstall: React.FC<GoLangInstallProps> = ({uri}): JSX.Element => {
	return (
		<LanguageInstall
			variants={[{
				install: <Card
					variant="outlined">
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={`go get -d ${unescapeString(uri.replace("/@v/", "@").replace(".mod", "").replace(".info", ""))}`}*/}
					{/*	language="bash"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</Card>,
				config: <Card
					variant="outlined">
					{/*					<CopyBlock*/}
					{/*						showLineNumbers={false}*/}
					{/*						text={`echo 'export GOPROXY="${API_URL}/api/plugin/-/mod/-/"' >> ~/.bashrc*/}
					{/*source ~/.bashrc`}*/}
					{/*						language="bash"*/}
					{/*						theme={dracula}*/}
					{/*						codeBlock*/}
					{/*					/>*/}
				</Card>,
				name: "Go Modules"
			}]}
		/>
	)
}
export default GoLangInstall;
