import {gql, QueryTuple, useLazyQuery} from "@apollo/client";
import {Archetype, Remote} from "../../types";

interface Data {
	listRemotes: Remote[];
}

interface Vars {
	arch: Archetype;
}

export const useListRemotes = (): QueryTuple<Data, Vars> => {
	return useLazyQuery(gql`
		query listRemotes($arch: String!) {
			listRemotes(arch: $arch) {
				id
				name
				updatedAt
				createdAt
				uri
				enabled
				archetype
			}
		}
	`);
}
export default useListRemotes;
