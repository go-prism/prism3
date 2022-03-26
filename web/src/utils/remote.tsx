import React, {ReactNode} from "react";
import {Theme} from "@material-ui/core";
import {Files} from "tabler-icons-react";
import {Archetype} from "../graph/types";

export const getRemoteIcon = (theme: Theme, type: Archetype): ReactNode => {
	switch (type) {
		case Archetype.HELM:
		case Archetype.ALPINE:
		case Archetype.MAVEN:
		case Archetype.NPM:
		case Archetype.GO:
		case Archetype.DEBIAN:
			return <img
				src={`/${type.toLocaleLowerCase()}_logo.svg`}
				alt={`${type} logo`}
				width={24}
				height={24}
			/>
		case Archetype.PIP:
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