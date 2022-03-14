import React, {ReactNode} from "react";
import Icon from "@mdi/react";
import {mdiServer} from "@mdi/js";
import {Theme} from "@material-ui/core";
import {Archetype} from "../graph/types";

export const getRemoteIcon = (theme: Theme, type: Archetype): ReactNode => {
	switch (type) {
		case Archetype.HELM:
		case Archetype.ALPINE:
		case Archetype.MAVEN:
		case Archetype.NPM:
		case Archetype.GO:
			return <img
				src={`/${type.toLocaleLowerCase()}_logo.svg`}
				alt={`${type} logo`}
				width={24}
				height={24}
			/>
		default:
			return <Icon
				path={mdiServer}
				color={theme.palette.text.secondary}
				size={1}
			/>
	}
}