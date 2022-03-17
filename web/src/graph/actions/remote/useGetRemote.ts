import {gql, QueryTuple, useLazyQuery} from "@apollo/client";
import {Remote} from "../../types";

interface Data {
	getRemote: Remote;
}

interface Vars {
	id: string;
}

export const useGetRemote = (): QueryTuple<Data, Vars> => {
	return useLazyQuery(gql`
		query getRemote($id: ID!) {
			getRemote(id: $id) {
				id
				createdAt
				updatedAt
				name
				uri
				archetype
				enabled
				transport {
					id
					name
					cert
					key
					ca
					skipTLSVerify
					httpProxy
					httpsProxy
					noProxy
                }
			}
		}
	`);
}
export default useGetRemote;
