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
import {Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../../config";
import {parseMavenPackage} from "../../../../../utils/parse";
import LanguageInstall from "./index";
import {Refraction} from "../../../../../graph/types";

interface JavaInstallProps {
	uri: string;
	refraction: Refraction;
}

const TYPE_MAVEN_XML = "maven-xml";
const TYPE_GRADLE_KT = "gradle-kotlin";
const TYPE_GRADLE_GROOVY = "gradle-groovy";

const JavaInstall: React.FC<JavaInstallProps> = ({uri, refraction}): JSX.Element => {

	const getInstall = (type: string): string => {
		const mvn = parseMavenPackage(uri);
		switch (type) {
			case TYPE_MAVEN_XML:
				return `<dependency>
	<groupId>${mvn?.groupId}</groupId>
	<artifactId>${mvn?.artifactId}</artifactId>
	<version>${mvn?.version}</version>
</dependency>`;
			case TYPE_GRADLE_KT:
				return `implementation("${mvn?.groupId}:${mvn?.artifactId}:${mvn?.version}")`;
			case TYPE_GRADLE_GROOVY:
				return `implementation '${mvn?.groupId}:${mvn?.artifactId}:${mvn?.version}'`;
			default:
				return "";
		}
	}

	const getConfig = (type: string): string => {
		switch (type) {
			case TYPE_MAVEN_XML:
				return `<repositories>
	<repository>
		<id>prism-maven</id>
		<url>${API_URL}/api/-/${refraction.name.toLocaleLowerCase()}</url>
	</repository>
</repositories>`;
			case TYPE_GRADLE_KT:
				return `maven("${API_URL}/api/-/${refraction.name.toLocaleLowerCase()}")`;
			case TYPE_GRADLE_GROOVY:
				return `maven {
	url '${API_URL}/api/-/${refraction.name.toLocaleLowerCase()}'
}`;
			default:
				return "";
		}
	}

	return (
		<LanguageInstall
			variants={[{
				install: <div>
					{/*<CopyBlock*/}
					{/*	text={getInstall(TYPE_MAVEN_XML)}*/}
					{/*	language="xml"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</div>,
				config: <div>
					<Typography
						style={{marginBottom: 4}}
						color="textSecondary">
						You can also set this Refraction globally by following the guide <Link to={`/settings/refract/${refraction.id}/-/edit#getting-setup`}>here</Link>.
					</Typography>
					{/*<CopyBlock*/}
					{/*	text={getConfig(TYPE_MAVEN_XML)}*/}
					{/*	language="xml"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</div>,
				name: "Maven XML"
			},
			{
				install: <div>
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={getInstall(TYPE_GRADLE_KT)}*/}
					{/*	language="kotlin"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</div>,
				config: <div>
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={getConfig(TYPE_GRADLE_KT)}*/}
					{/*	language="kotlin"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</div>,
				name: "Gradle Kotlin DSL"
			},
			{
				install: <div>
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={getInstall(TYPE_GRADLE_GROOVY)}*/}
					{/*	language="groovy"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</div>,
				config: <div>
					{/*<CopyBlock*/}
					{/*	showLineNumbers={false}*/}
					{/*	text={getConfig(TYPE_GRADLE_GROOVY)}*/}
					{/*	language="groovy"*/}
					{/*	theme={dracula}*/}
					{/*	codeBlock*/}
					{/*/>*/}
				</div>,
				name: "Gradle Groovy DSL"
			}
			]}
		/>
	)
}
export default JavaInstall;
