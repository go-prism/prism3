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
import FolderTreeItem, {TreeNode} from "../../list/FolderTreeItem";
import {Node} from "../Overview";
import useLoading from "../../../hooks/useLoading";
import useErrors from "../../../hooks/useErrors";
import {CacheEntryV1, RefractionV1} from "../../../config/types";
import SidebarLayout from "../../layout/SidebarLayout";
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

const Browser: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();
	const history = useHistory();
	const {ref} = useParams<OverviewParams>();
	const classes = useStyles();

	// global state
	const refractions: RefractionV1[] = [];
	const cacheEntries: CacheEntryV1[] = [];
	
	const loadingEntries = useLoading([]);
	const errorEntries = useErrors([]);

	const loadingRefracts = useLoading([]);
	const errorRefracts = useErrors([]);

	// local state
	const [open, setOpen] = useState<RefractionV1 | null>(null);
	const [selected, setSelected] = useState<string>("");

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
		for (const e of cacheEntries) {
			if (e.id === selected)
				return e;
		}
		return null;
	}, [cacheEntries, selected]);

	useEffect(() => {
		if (ref == null) {
			// dispatch(resetAction(RESET_CACHES));
			setOpen(null);
			return;
		}
		for (const r of refractions) {
			if (r.id === ref) {
				setOpen(r);
				onLoadData(r.id);
				return;
			}
		}
		setOpen(null);
		// dispatch(resetAction(RESET_CACHES));
	}, [refractions, ref]);

	// useEffect(() => {
	// 	dispatch(listRefracts());
	// 	return () => {
	// 		dispatch(resetAction(REFRACT_LIST));
	// 		dispatch(resetAction(CACHE_LIST));
	// 	}
	// }, []);

	const onLoadData = (id: string): void => {
		// dispatch(resetAction(RESET_CACHES));
		// dispatch(listCacheByRefract(id));
	}

	const data = useMemo(() => {
		return cacheEntries.reduce((r: TreeNode[], p) => {
			const names = p.uri.split("/").map(n => ({first: n, second: p}));
			names.reduce((q, value) => {
				let temp = q.find(o => o.name === value.first);
				if (!temp) {
					q.push(temp = {id: `${value.first}${value.second.id}`, name: value.first, item: value.second, children: []});
				}
				return temp.children;
			}, r);
			return r;
		}, []);
	}, [cacheEntries]);

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
		for (const datum of data) {
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
				{loadingEntries && <ListItemSkeleton icon/>}
				{!loadingEntries && errorEntries != null && <Alert
					severity="error">
					Failed to load data.
				</Alert>}
				{!loadingEntries && errorEntries == null && flattenedData.length === 0 && <Alert
					severity="info">
					No data could be found.
				</Alert>}
				{/*{!loadingEntries && errorEntries == null && flattenedData.length > 0 && <AutoSizer>*/}
				{/*	{({height, width}) => (*/}
				{/*		<FixedSizeList*/}
				{/*			itemCount={flattenedData.length}*/}
				{/*			itemSize={36}*/}
				{/*			width={width}*/}
				{/*			height={height}*/}
				{/*			itemKey={i => flattenedData[i].node.id}>*/}
				{/*			{Row}*/}
				{/*		</FixedSizeList>)}*/}
				{/*</AutoSizer>}*/}
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
				{selectedItem == null && errorRefracts == null && <Alert
					severity="info">
					Nothing has been selected
				</Alert>}
				{!loadingRefracts && errorRefracts != null && <Alert
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
