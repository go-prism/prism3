import {gql, MutationTuple, useMutation} from "@apollo/client";
import {Refraction} from "../../types";

interface Data {
	patchRefraction: Refraction;
}

interface Vars {
	id: string;
	name: string;
	remotes: string[];
}

export const usePatchRefract = (): MutationTuple<Data, Vars> => {
	return useMutation(gql`
		mutation patchRefract($id: ID!, $name: String!, $remotes: [String!]!) {
			patchRefraction(id: $id, input: {name: $name, remotes: $remotes}) {
				id
			}
		}
	`);
}
export default usePatchRefract;
