import {gql, MutationTuple, useMutation} from "@apollo/client";
import {Archetype, Refraction} from "../../types";

interface Data {
	createRefraction: Refraction;
}

interface Vars {
	name: string;
	archetype: Archetype;
	remotes: string[];
}

export const useCreateRefract = (): MutationTuple<Data, Vars> => {
	return useMutation(gql`
		mutation createRefract($name: String!, $archetype: Archetype!, $remotes: [ID!]!) {
			createRefraction(input: {name: $name, archetype: $archetype, remotes: $remotes}) {
				id
			}
		}
	`);
}
export default useCreateRefract;
