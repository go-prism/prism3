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

import React, {CSSProperties, ReactElement, useMemo, useState} from "react";
import {ListItemSkeleton} from "jmp-coreui";
import {Alert} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {useHistory} from "react-router-dom";
import {useParams} from "react-router";
import LZString from "lz-string";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import FolderTreeItem, {TreeNode} from "../../list/FolderTreeItem";
import {Node} from "../Overview";
import SidebarLayout from "../../layout/SidebarLayout";
import RefractHeader from "../../widgets/RefractHeader";
import InlineNotFound from "../../widgets/InlineNotFound";
import {Artifact, Refraction} from "../../../generated/graphql";
import ObjectInfo from "./ObjectInfo";
import {BrowserProps} from "./Browser";

export interface OverviewParams {
	ref?: string;
}

const BrowserTree: React.FC<BrowserProps> = ({data, loading, error}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const history = useHistory();
	const {ref} = useParams<OverviewParams>();

	// local state
	const [selected, setSelected] = useState<string>("");

	const expanded: string[] = useMemo(() => {
		return LZString.decompressFromEncodedURIComponent(history.location.hash.replace("#", ""))?.split("/") || [];
	}, [history.location.hash]);

	const selectedItem = useMemo(() => {
		if (data?.listCombinedArtifacts == null)
			return null;
		for (const e of data.listCombinedArtifacts) {
			if (e.id === selected)
				return e;
		}
		return null;
	}, [data?.listCombinedArtifacts, selected]);

	const items = useMemo(() => {
		if (data?.listCombinedArtifacts == null)
			return [];
		return data.listCombinedArtifacts.reduce((r: TreeNode[], p) => {
			// filter out empty paths (closes #1)
			const names = p.uri.split("/").filter(n => n !== "").map(n => ({first: n, second: p}));
			names.reduce((q, value) => {
				let temp = q.find(o => o.name === value.first);
				if (!temp) {
					q.push(temp = {id: `${value.first}${value.second.id}`, name: value.first, item: value.second as Artifact, children: []});
				}
				return temp.children;
			}, r);
			return r;
		}, []).sort((a, b) => a.name.localeCompare(b.name));
	}, [data?.listCombinedArtifacts]);

	const onNodeToggle = (ids: string[]): void => {
		history.push({
			...history.location,
			hash: LZString.compressToEncodedURIComponent(ids.join("/"))
		});
	}

	const onNodeSelect = (id: string): void => {
		setSelected(selected === id ? "" : id);
		if (expanded.includes(id)) {
			onNodeToggle(expanded.filter(i => i !== id && id !== ""));
			return;
		}
		onNodeToggle([...expanded, id]);
	}
	
	const flattenOpened = (): Node[] => {
		const result: Node[] = [];
		for (const datum of items) {
			flattenNode(datum, 1, result);
		}
		return result;
	}

	const flattenNode = (node: TreeNode, depth: number, result: Node[]): void => {
		const id = node.children.length === 0 ? node.item.id : `${node.item.id}-${node.name}`;
		const collapsed = !expanded.includes(id);
		result.push({
			node: node,
			depth: depth,
			collapsed: collapsed,
			hasChildren: node.children.length > 0
		});
		if (collapsed) {
			return;
		}
		node.children.sort((a, b) => a.name.localeCompare(b.name));
		for (const child of node.children) {
			flattenNode(child, depth + 1, result);
		}
	}

	const flattenedData = useMemo(() => {
		return flattenOpened();
	}, [expanded, ref, data]);

	const Row = ({index, style}: {index: number, style: CSSProperties}): ReactElement => {
		return <FolderTreeItem
			item={flattenedData[index]}
			style={style}
			selected={selected}
			setSelected={onNodeSelect}
		/>;
	}
	return <SidebarLayout
		sidebar={<div
			style={{height: "calc(100vh - 112px)", maxHeight: "calc(100vh - 112px)"}}>
			{loading && <ListItemSkeleton icon/>}
			{!loading && error != null && <Alert
				severity="error">
						Failed to load data.
			</Alert>}
			{!loading && error == null && flattenedData.length === 0 && <InlineNotFound/>}
			{!loading && error == null && flattenedData.length > 0 && <AutoSizer>
				{({height, width}) => (
					<FixedSizeList
						itemCount={flattenedData.length}
						itemSize={36}
						width={width}
						height={height}
						itemKey={i => flattenedData[i].node.id}>
						{Row}
					</FixedSizeList>)}
			</AutoSizer>}
		</div>}>
		<div
			style={{margin: theme.spacing(1)}}>
			<RefractHeader
				refraction={data?.getRefraction ? data.getRefraction as Refraction : null}
				loading={loading}
			/>
			{!loading && error != null && <Alert
				severity="error">
						Failed to load refractions.
			</Alert>}
			{selectedItem != null && data?.getRefraction != null && <ObjectInfo
				item={selectedItem as Artifact}
				refraction={data.getRefraction as Refraction}
			/>}
		</div>
	</SidebarLayout>
};
export default BrowserTree;
