import {gql, QueryResult, useQuery} from "@apollo/client";
import {Role, RoleBinding} from "../../types";

interface Vars {
	role: Role;
}

interface Data {
	getUsers: RoleBinding[];
}

export const useGetUsers = (vars: Vars): QueryResult<Data, Vars> => {
	return useQuery(gql`
		query getUsers($role: Role!) {
			getUsers(role: $role) {
				id
				role
				subject
				resource
			}
		}
	`, {variables: vars});
}
export default useGetUsers;
