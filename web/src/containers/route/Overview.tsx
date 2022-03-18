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
import {useTheme} from "@material-ui/core/styles";
import {Apps} from "tabler-icons-react";
import {TreeNode} from "../list/FolderTreeItem";
import {getRemoteIcon} from "../../utils/remote";
import useListRefractions from "../../graph/actions/remote/useListRefractions";
import SidebarLayout from "../layout/SidebarLayout";
import SimpleSidebar, {SidebarItem} from "../layout/SimpleSidebar";

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
	const {data, loading} = useListRefractions();

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
			to: `/-/${r.id}`
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
			Test
		</SidebarLayout>
	);
}
export default Overview;
