import {Archetype} from "../graph/types";

export const REMOTE_ARCHETYPES: {name: string, value: Archetype, stable: boolean}[] = [
	{name: "Generic", value: Archetype.GENERIC, stable: true},
	{name: "Maven", value: Archetype.MAVEN, stable: true},
	{name: "NPM", value: Archetype.NPM, stable: false},
	{name: "Alpine", value: Archetype.ALPINE, stable: true},
	{name: "Helm", value: Archetype.HELM, stable: false}
];

export const DEFAULT_RESTRICTED_HEADERS = [
	"Authorization",
	"Private-Token",
	"Deploy-Token",
	"Job-Token"
];
