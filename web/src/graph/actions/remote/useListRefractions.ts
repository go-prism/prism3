import {gql, QueryResult, useQuery} from "@apollo/client";
import {Refraction} from "../../types";

interface Data {
	listRefractions: Refraction[];
}

export const useListRefractions = (): QueryResult<Data, void> => {
	return useQuery(gql`
		query listRefractions {
			listRefractions {
				id
				createdAt
				updatedAt
				name
				archetype
            }
		}
	`);
}
export default useListRefractions;
