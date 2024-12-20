/*
 *    Copyright 2021 Django Cass
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

import React, {useEffect, useMemo} from "react";
import {useTheme} from "@mui/material/styles";
import {Apps} from "tabler-icons-react";
import {Typography} from "@mui/material";
import {TreeNode} from "../list/FolderTreeItem";
import {getRemoteIcon} from "../../utils/remote";
import SidebarLayout from "../layout/SidebarLayout";
import SimpleSidebar, {SidebarItem} from "../layout/SimpleSidebar";
import InfoCard from "../widgets/InfoCard";
import {useListRefractionsQuery} from "../../generated/graphql";

export interface Node {
	node: TreeNode;
	hasChildren: boolean;
	depth: number;
	collapsed: boolean;
}

const Overview: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();

	// global state
	const {data, loading} = useListRefractionsQuery();

	useEffect(() => {
		window.document.title = "Prism";
	}, []);

	const items: SidebarItem[] = useMemo(() => {
		if (data?.listRefractions == null)
			return [];
		return data.listRefractions.map(r => ({
			id: r.id,
			label: r.name,
			icon: getRemoteIcon(theme, r.archetype),
			to: `/artifacts/-/${r.id}`
		}));
	}, [data?.listRefractions]);
	
	return (
		<SidebarLayout
			sidebar={<SimpleSidebar
				items={items}
				header="Artifacts"
				icon={Apps}
				loading={loading}
			/>}>
			<InfoCard
				title="Artifacts"
				icon={Apps}>
				<Typography
					color="textSecondary">
					An artifact is a package or binary that has been retrieved by a Prism user.
				</Typography>
			</InfoCard>
		</SidebarLayout>
	);
}
export default Overview;
