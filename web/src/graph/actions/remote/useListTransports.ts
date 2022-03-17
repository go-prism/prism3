import {gql, QueryResult, useQuery} from "@apollo/client";
import {TransportSecurity} from "../../types";

interface Data {
	listTransports: TransportSecurity[];
}

export const useListTransports = (): QueryResult<Data, void> => {
	return useQuery(gql`
		query listTransports {
			listTransports {
				id
				name
				skipTLSVerify
				ca
				cert
				noProxy
				httpProxy
				httpsProxy
            }
		}
	`);
}
export default useListTransports;
