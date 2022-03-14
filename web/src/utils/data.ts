import {ValidatedData} from "jmp-coreui";

/**
 * Returns whether a given piece of ValidatedData is ready for use
 * @param data
 * @constructor
 */
export const DataIsValid = (data: ValidatedData): boolean => {
	return data.error === "" && data.value !== "";
}