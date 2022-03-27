import {gql, MutationTuple, useMutation} from "@apollo/client";
import {Role, RoleBinding} from "../../types";

interface Data {
	createRoleBinding: RoleBinding;
}

interface Vars {
	subject: string;
	role: Role;
	resource: string;
}

export const useCreateRoleBinding = (): MutationTuple<Data, Vars> => {
	return useMutation(gql`
		mutation createRoleBinding($subject: String!, $role: Role!, $resource: String!) {
			createRoleBinding(input: {subject: $subject, role: $role, resource: $resource}) {
				id
			}
		}
	`);
}
export default useCreateRoleBinding;
