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
import {Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {API_URL} from "../../../../../config";
import {parseMavenPackage} from "../../../../../utils/parse";
import {Refraction} from "../../../../../graph/types";
import CodeBlock from "../../../../widgets/CodeBlock";
import LanguageInstall from "./index";

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
					<CodeBlock
						code={getInstall(TYPE_MAVEN_XML)}
						language="xml"
					/>
				</div>,
				config: <div>
					<Typography
						style={{marginBottom: 4}}
						color="textSecondary">
						You can also set this Refraction globally by following the guide <Link to={`/refract/${refraction.id}/-/edit#getting-setup`}>here</Link>.
					</Typography>
					<CodeBlock
						code={getConfig(TYPE_MAVEN_XML)}
						language="xml"
					/>
				</div>,
				name: "Maven XML"
			},
			{
				install: <div>
					<CodeBlock
						code={getInstall(TYPE_GRADLE_KT)}
						language="kotlin"
					/>
				</div>,
				config: <div>
					<CodeBlock
						code={getConfig(TYPE_GRADLE_KT)}
						language="kotlin"
					/>
				</div>,
				name: "Gradle Kotlin DSL"
			},
			{
				install: <div>
					<CodeBlock
						code={getInstall(TYPE_GRADLE_GROOVY)}
						language="groovy"
					/>
				</div>,
				config: <div>
					<CodeBlock
						code={getConfig(TYPE_GRADLE_GROOVY)}
						language="groovy"
					/>
				</div>,
				name: "Gradle Groovy DSL"
			}
			]}
		/>
	)
}
export default JavaInstall;
