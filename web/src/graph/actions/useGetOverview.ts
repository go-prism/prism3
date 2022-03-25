import {gql, QueryResult, useQuery} from "@apollo/client";
import {Overview} from "../types";

interface Data {
	getOverview: Overview;
}

export const useGetOverview = (): QueryResult<Data, void> => {
	return useQuery(gql`
		query getOverview {
			getOverview {
				remotes
				refractions
				artifacts
				storage
				downloads
				uptime
				version
            }
		}
	`, {pollInterval: 10000});
}
export default useGetOverview;
