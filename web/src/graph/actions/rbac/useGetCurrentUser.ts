import {gql, QueryResult, useQuery} from "@apollo/client";
import {User} from "../../types";

interface Data {
	getCurrentUser: User;
}

export const useGetCurrentUser = (): QueryResult<Data, void> => {
	return useQuery(gql`
		query getCurrentUser {
            getCurrentUser {
	            sub
	            iss
            }
		}
	`);
}
export default useGetCurrentUser;
