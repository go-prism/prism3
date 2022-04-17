import React, {ReactNode} from "react";
import {Files} from "tabler-icons-react";
import {Theme} from "@mui/material/styles";
import {Avatar} from "@mui/material";
import {Archetype} from "../generated/graphql";
import {stringToColour} from "./data";
import {toTitleCase} from "./format";

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

export const getResourceName = (s: string): string => {
	const [,name] = s.split("::", 2);
	return toTitleCase(name);
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