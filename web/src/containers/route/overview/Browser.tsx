/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import {ApolloError} from "@apollo/client";
import {OverviewQuery, useOverviewLazyQuery} from "../../../generated/graphql";
import usePref from "../../../hooks/usePref";
import {PREF_VIEW_ARTIFACT_LIST} from "../../../config/constants";
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
	const [preferList] = usePref(PREF_VIEW_ARTIFACT_LIST);

	useEffect(() => {
		if (!ref)
			return;
		void getData({variables: {refract: ref}});
	}, [ref]);

	useEffect(() => {
		setList(() => preferList === "true");
	}, [preferList]);

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
