import {useMemo} from "react";
import {useSetPreferenceMutation, useWatchCurrentUserSubscription} from "../generated/graphql";

const usePref = (key: string): [string, (val: string) => void] => {
	const {data} = useWatchCurrentUserSubscription();
	const [setPreference] = useSetPreferenceMutation();
	
	const value = useMemo(() => {
		return data?.getCurrentUser.preferences[key] || "";
	}, [data]);
	
	const onSetValue = (val: string): void => {
		void setPreference({variables: {key, value: val}});
	}
	
	return [value, onSetValue];
}
export default usePref;
