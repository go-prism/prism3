/*
 *    Copyright 2022 Django Cass
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

import React, {ReactNode} from "react";
import {
	BrandDebian,
	BrandPython,
	Certificate,
	Coffee,
	Database,
	FileCode,
	FileInvoice,
	Files,
	FileZip,
	Hexagon,
	Icon,
	Package
} from "tabler-icons-react";
import {Theme} from "@mui/material/styles";
import {Avatar} from "@mui/material";
import {Archetype} from "../generated/graphql";
import {stringToColour} from "./data";

export const getRemoteIcon = (theme: Theme, type: Archetype): ReactNode => {
	switch (type) {
		case Archetype.Helm:
		case Archetype.Alpine:
		case Archetype.Maven:
		case Archetype.Npm:
		case Archetype.Go:
		case Archetype.Debian:
			return <img
				src={`/${type.toLocaleLowerCase()}_logo.svg`}
				alt={`${type} logo`}
				width={24}
				height={24}
			/>
		case Archetype.Pip:
			return <img
				src={`/${type.toLocaleLowerCase()}_logo.png`}
				alt={`${type} logo`}
				width={24}
				height={24}
			/>
		default:
			return <Files
				color={theme.palette.text.secondary}
			/>
	}
}

export const getNodeIcon = (name: string): Icon => {
	switch (true) {
		case name === "APKINDEX.tar.gz":
			return Database;
		case name.endsWith(".pom"):
			return FileInvoice;
		case name.endsWith(".sha1"):
			return Certificate;
		case name.endsWith(".jar"):
			return Coffee;
		case name.endsWith(".tgz"):
		case name.endsWith(".tar.gz"):
		case name.endsWith(".apk"):
			return Package;
		case name.endsWith(".deb"):
			return BrandDebian;
		case name.endsWith(".zip"):
			return FileZip;
		case name.endsWith(".mod"):
			return Hexagon;
		case name.endsWith(".whl"):
			return BrandPython;
		default:
			return FileCode;
	}
};

export const getNodeColour = (theme: Theme, name: string): [string, string] => {
	switch (true) {
		case name.endsWith(".whl"):
		case name.endsWith(".pom"):
			return [theme.palette.success.main, theme.palette.success.light];
		case name.endsWith(".jar"):
			return [theme.palette.warning.main, theme.palette.warning.light];
		case name.endsWith(".deb"):
			return [theme.palette.error.main, theme.palette.error.light];
		case name.endsWith(".mod"):
		case name.endsWith(".tgz"):
		case name.endsWith(".tar.gz"):
		case name.endsWith(".apk"):
			return [theme.palette.primary.main, theme.palette.primary.light];
		default:
			return [theme.palette.text.secondary, theme.palette.action.hover];
	}
};

export const getResourceName = (s: string): string => {
	const [,name] = s.split("::", 2);
	return name;
}

export const getResourceIcon = (theme: Theme, resource: string): ReactNode => {
	const sx = {marginRight: theme.spacing(1)};
	const [type] = resource.split("::", 1);

	let colour;
	let name;

	switch (type) {
		case "refraction":
			colour = theme.palette.info.main;
			name = "RF";
			break;
		case "remote":
			colour = theme.palette.secondary.main;
			name = "R";
			break;
		default:
			colour = stringToColour(type);
			name = type.substr(0, 1).toLocaleUpperCase();
			break;
	}
	return <Avatar
		variant="rounded"
		sx={{
			...sx,
			bgcolor: colour,
			width: 24,
			height: 24,
			fontSize: 14
		}}>
		{name}
	</Avatar>
}