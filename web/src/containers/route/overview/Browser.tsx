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

import React, {CSSProperties, ReactElement, useEffect, useMemo, useState} from "react";
import {ListItemSkeleton} from "jmp-coreui";
import {Alert} from "@material-ui/lab";
import {useTheme} from "@material-ui/core/styles";
import {Link, useHistory} from "react-router-dom";
import {useParams} from "react-router";
import LZString from "lz-string";
import {IconButton, makeStyles, Theme} from "@material-ui/core";
import Icon from "@mdi/react";
import {mdiArrowLeft} from "@mdi/js";
import {gql, useQuery} from "@apollo/client";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import FolderTreeItem, {TreeNode} from "../../list/FolderTreeItem";
import {Node} from "../Overview";
import SidebarLayout from "../../layout/SidebarLayout";
import {Artifact, Refraction} from "../../../graph/types";
import ObjectInfo from "./ObjectInfo";

const useStyles = makeStyles((theme: Theme) => ({
	icon: {
		margin: theme.spacing(1),
		marginRight: theme.spacing(2)
	}
}));

interface OverviewParams {
	ref?: string;
}

interface QueryData {
	listRefractions: Refraction[];
	listCombinedArtifacts: Artifact[];
}

interface QueryVars {
	refract: string;
}

const Browser: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();
	const history = useHistory();
	const {ref} = useParams<OverviewParams>();
	const classes = useStyles();

	// local state
	const [open, setOpen] = useState<Refraction | null>(null);
	const [selected, setSelected] = useState<string>("");

	const {data, loading, error} = useQuery<QueryData, QueryVars>(gql`
        query overview($refract: ID!) {
            listRefractions {
                id
                name
                createdAt
                updatedAt
                archetype
            }
            listCombinedArtifacts(refract: $refract) {
                id
                uri
                updatedAt
                createdAt
                downloads
            }
        }
	`, {variables: {refract: ref || ""}});

	const expanded: string[] = useMemo(() => {
		return LZString.decompressFromEncodedURIComponent(history.location.hash.replace("#", ""))?.split("/") || [];
	}, [history.location.hash]);

	useEffect(() => {
		if (open == null) {
			window.document.title = "Prism";
			return;
		}
		window.document.title = `Prism - ${open.name}`;
	}, [open]);

	const selectedItem = useMemo(() => {
		if (data?.listCombinedArtifacts == null)
			return null;
		for (const e of data.listCombinedArtifacts) {
			if (e.id === selected)
				return e;
		}
		return null;
	}, [data?.listCombinedArtifacts, selected]);

	useEffect(() => {
		if (ref == null) {
			setOpen(null);
			return;
		}
		if (data?.listRefractions == null)
			return;
		for (const r of data.listRefractions) {
			if (r.id === ref) {
				setOpen(r);
				return;
			}
		}
		setOpen(null);
	}, [data, ref]);

	const items = useMemo(() => {
		if (data?.listCombinedArtifacts == null)
			return [];
		return data.listCombinedArtifacts.reduce((r: TreeNode[], p) => {
			const names = p.uri.split("/").map(n => ({first: n, second: p}));
			names.reduce((q, value) => {
				let temp = q.find(o => o.name === value.first);
				if (!temp) {
					q.push(temp = {id: `${value.first}${value.second.id}`, name: value.first, item: value.second, children: []});
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
	return (
		<SidebarLayout
			sidebar={<div
				style={{height: "calc(100vh - 112px)", maxHeight: "calc(100vh - 112px)"}}>
				{loading && <ListItemSkeleton icon/>}
				{!loading && error != null && <Alert
					severity="error">
					Failed to load data.
				</Alert>}
				{!loading && error == null && flattenedData.length === 0 && <Alert
					severity="info">
					No data could be found.
				</Alert>}
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
				<div>
					<IconButton
						className={classes.icon}
						component={Link}
						to="/">
						<Icon
							path={mdiArrowLeft}
							size={0.8}
							color={theme.palette.text.secondary}
						/>
					</IconButton>
					Back
				</div>
				{selectedItem == null && error == null && <Alert
					severity="info">
					Nothing has been selected
				</Alert>}
				{!loading && error != null && <Alert
					severity="error">
					Failed to load refractions.
				</Alert>}
				{selectedItem != null && open != null && <ObjectInfo
					item={selectedItem}
					refraction={open}
				/>}
			</div>
		</SidebarLayout>
	);
};
export default Browser;
