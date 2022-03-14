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

import {ApolloError} from "@apollo/client";
import {ErrorState} from "../domain/errors";

export const getGraphErrorMessage = (error?: ApolloError | null): string => {
	return error?.message || "Unknown error";
};

/**
 * Try to extract the actual message as best we can.
 * @param error: the error object
 */
const getErrorMessage = (error: ErrorState | null): string => {
	if (error == null)
		return "Something went wrong";
	return error.payload?.response?.message || error.payload?.response?.error || error.payload?.message || error.message || "Something went wrong";
}
export default getErrorMessage;
