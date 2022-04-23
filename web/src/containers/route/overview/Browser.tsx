import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import {ApolloError} from "@apollo/client";
import {OverviewQuery, useOverviewLazyQuery} from "../../../generated/graphql";
import BrowserTree, {OverviewParams} from "./BrowserTree";
import BrowserList from "./BrowserList";
import BrowserToolbar from "./BrowserToolbar";

export interface BrowserProps {
	data?: OverviewQuery;
	loading: boolean;
	error?: ApolloError;
}

const Browser: React.FC = (): JSX.Element => {
	const {ref} = useParams<OverviewParams>();
	const [list, setList] = useState<boolean>(false);

	const [getData, {data, loading, error}] = useOverviewLazyQuery({variables: {refract: ref || ""}});

	useEffect(() => {
		if (!ref)
			return;
		void getData({variables: {refract: ref}});
	}, [ref]);

	useEffect(() => {
		if (data?.getRefraction == null) {
			window.document.title = "Prism";
			return;
		}
		window.document.title = `Prism - ${data.getRefraction.name}`;
	}, [data?.getRefraction]);

	const Component = list ? BrowserList : BrowserTree;
	return <div>
		<BrowserToolbar
			id={ref || ""}
			onToggleLayout={() => setList(l => !l)}
		/>
		<Component
			data={data}
			loading={loading}
			error={error}
		/>
	</div>
}
export default Browser;
