import {ValidatedData} from "jmp-coreui";

/**
 * Returns whether a given piece of ValidatedData is ready for use
 * @param data
 * @constructor
 */
export const DataIsValid = (data: ValidatedData): boolean => {
	return data.error === "" && data.value !== "";
}

/**
 * Generates a colour based
 * on a given string input
 * @param s
 */
export const stringToColour = (s : string): string => {
	let hash = 0;
	for (let i = 0; i < s.length; i++) {
		hash = s.charCodeAt(i) + ((hash << 5) - hash);
	}
	let colour = "#";
	for (let i = 0; i < 3; i++) {
		const val = (hash >> (i * 8)) & 0xff;
		colour += `00${val.toString(16)}`.slice(-2);
	}
	return colour;
}
