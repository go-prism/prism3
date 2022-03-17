import {gql, QueryTuple, useLazyQuery} from "@apollo/client";
import {Refraction} from "../../types";

interface Data {
	getRefraction: Refraction;
}

interface Vars {
	id: string;
}

export const useGetRefraction = (): QueryTuple<Data, Vars> => {
	return useLazyQuery(gql`
		query getRefraction($id: ID!) {
			getRefraction(id: $id) {
				id
				createdAt
				updatedAt
				name
				archetype
				remotes {
					id
					name
                }
			}
		}
	`);
}
export default useGetRefraction;
