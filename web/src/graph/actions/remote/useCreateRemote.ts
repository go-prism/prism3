import {gql, MutationTuple, useMutation} from "@apollo/client";
import {Archetype, Remote} from "../../types";

interface Data {
	createRemote: Remote;
}

interface Vars {
	name: string;
	uri: string;
	archetype: Archetype;
	transport: string;
}

export const useCreateRemote = (): MutationTuple<Data, Vars> => {
	return useMutation(gql`
		mutation createRemote($name: String!, $uri: String!, $archetype: Archetype!, $transport: ID!) {
			createRemote(input: {name: $name, uri: $uri, archetype: $archetype, transport: $transport}) {
				id
			}
		}
	`);
}
export default useCreateRemote;
