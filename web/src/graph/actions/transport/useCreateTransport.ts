import {gql, MutationTuple, useMutation} from "@apollo/client";
import {TransportSecurity} from "../../types";

interface Data {
	createTransportProfile: TransportSecurity;
}

interface Vars {
	name: string;
	ca: string;
	cert: string;
	key: string;
	skipTLSVerify: boolean;
	httpProxy: string;
	httpsProxy: string;
	noProxy: string;
}

export const useCreateTransport = (): MutationTuple<Data, Vars> => {
	return useMutation(gql`
		mutation createTransport($name: String!, $ca: String!, $cert: String!, $key: String!, $skipTLSVerify: Boolean!, $httpProxy: String!, $httpsProxy: String!, $noProxy: String!) {
			createTransportProfile(input: {name: $name, ca: $ca, cert: $cert, key: $key, skipTLSVerify: $skipTLSVerify, httpProxy: $httpProxy, httpsProxy: $httpsProxy, noProxy: $noProxy}) {
				id
			}
		}
	`);
}
export default useCreateTransport;
