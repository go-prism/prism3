import {Archetype} from "../generated/graphql";


export const REMOTE_ARCHETYPES: {name: string, value: Archetype, stable: boolean}[] = [
	{name: "Generic", value: Archetype.Generic, stable: true},
	{name: "Maven", value: Archetype.Maven, stable: true},
	{name: "NPM", value: Archetype.Npm, stable: true},
	{name: "Alpine", value: Archetype.Alpine, stable: true},
	{name: "Helm", value: Archetype.Helm, stable: true},
	{name: "Debian", value: Archetype.Debian, stable: false},
	{name: "PyPI", value: Archetype.Pip, stable: true}
];

export const DEFAULT_RESTRICTED_HEADERS = [
	"Authorization",
	"Private-Token",
	"Deploy-Token",
	"Job-Token"
];

export const PREF_DARK_THEME = "dark-theme";
