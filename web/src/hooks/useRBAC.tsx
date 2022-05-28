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

import {useUserCanQuery, Verb} from "../generated/graphql";

interface CanProps {
	type: string;
	id: string;
	verb: Verb;
}

const useCanRBAC = ({type, id, verb}: CanProps): boolean => {
	const {data} = useUserCanQuery({variables: {
		resource: `${type}::${id}`,
		action: verb,
	}});

	return data?.userCan || false;
}
export default useCanRBAC;
