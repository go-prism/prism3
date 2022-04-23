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
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import kotlin from "react-syntax-highlighter/dist/esm/languages/hljs/kotlin";
import groovy from "react-syntax-highlighter/dist/esm/languages/hljs/groovy";
import {API_URL} from "../../../../../config";
import {parseMavenPackage} from "../../../../../utils/parse";
import {Refraction} from "../../../../../generated/graphql";
import LanguageInstall from "./index";

interface JavaInstallProps {
	uri: string;
	refraction: Refraction;
}

const TYPE_MAVEN_XML = "maven-xml";
const TYPE_GRADLE_KT = "gradle-kotlin";
const TYPE_GRADLE_GROOVY = "gradle-groovy";

const JavaInstall: React.FC<JavaInstallProps> = ({uri, refraction}): JSX.Element => {
	useLayoutEffect(() => {
		SyntaxHighlighter.registerLanguage("xml", xml);
		SyntaxHighlighter.registerLanguage("kotlin", kotlin);
		SyntaxHighlighter.registerLanguage("groovy", groovy);
	}, []);

	const url = `${API_URL}/api/v1/${refraction.name.toLocaleLowerCase()}/-/`;

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
		<url>${url}</url>
	</repository>
</repositories>`;
			case TYPE_GRADLE_KT:
				return `maven("${url}")`;
			case TYPE_GRADLE_GROOVY:
				return `maven {
	url '${url}'
}`;
			default:
				return "";
		}
	}

	return (
		<LanguageInstall
			variants={[{
				install: getInstall(TYPE_MAVEN_XML),
				installLang: "xml",
				config: getConfig(TYPE_MAVEN_XML),
				configLang: "xml",
				name: "Maven XML"
			},
			{
				install: getInstall(TYPE_GRADLE_KT),
				installLang: "kotlin",
				config: getConfig(TYPE_GRADLE_KT),
				configLang: "kotlin",
				name: "Gradle Kotlin DSL"
			},
			{
				install: getInstall(TYPE_GRADLE_GROOVY),
				installLang: "groovy",
				config: getConfig(TYPE_GRADLE_GROOVY),
				configLang: "groovy",
				name: "Gradle Groovy DSL"
			}
			]}
		/>
	)
}
export default JavaInstall;
