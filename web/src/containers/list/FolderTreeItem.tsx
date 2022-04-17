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

import React, {CSSProperties, useMemo} from "react";
import {useTheme} from "@mui/material/styles";
import {ListItem, ListItemIcon, ListItemText, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {
	BrandDebian,
	BrandPython,
	Certificate,
	Coffee,
	Database,
	FileCode,
	FileInvoice,
	FileZip,
	Folder,
	Hexagon,
	Package
} from "tabler-icons-react";
import {unescapeString} from "../../utils/encode";
import {Node} from "../route/Overview";
import {Artifact} from "../../generated/graphql";

interface StyleProps {
	primary: string;
	secondary: string;
}

const useStyles = makeStyles<StyleProps>()((theme: Theme, props: StyleProps) => ({
	root: {
		borderRadius: theme.spacing(4),
		color: props.primary,
	},
	row: {
		textOverflow: "ellipsis",
		overflow: "hidden",
		whiteSpace: "nowrap"
	}
}));

export interface TreeNode {
	id: string;
	name: string;
	item: Artifact;
	children: TreeNode[];
}

interface FolderTreeItemProps {
	item: Node;
	style: CSSProperties;
	selected: string;
	setSelected: (val: string) => void;
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({item, style, selected, setSelected}): JSX.Element => {
	// hooks
	const theme = useTheme();

	const {node, depth} = item;

	const Icon = useMemo(() => {
		switch (true) {
			case node.name === "APKINDEX.tar.gz":
				return Database;
			case node.name.endsWith(".pom"):
				return FileInvoice;
			case node.name.endsWith(".sha1"):
				return Certificate;
			case node.name.endsWith(".jar"):
				return Coffee;
			case node.name.endsWith(".tgz"):
			case node.name.endsWith(".tar.gz"):
			case node.name.endsWith(".apk"):
				return Package;
			case node.name.endsWith(".deb"):
				return BrandDebian;
			case node.name.endsWith(".zip"):
				return FileZip;
			case node.name.endsWith(".mod"):
				return Hexagon;
			case node.name.endsWith(".whl"):
				return BrandPython;
			default:
				return node.children.length === 0 ? FileCode : Folder;
		}
	}, [node.name]);

	const colours = useMemo(() => {
		switch (true) {
			case node.name.endsWith(".whl"):
			case node.name.endsWith(".pom"):
				return [theme.palette.success.main, theme.palette.success.light];
			case node.name.endsWith(".jar"):
				return [theme.palette.warning.main, theme.palette.warning.light];
			case node.name.endsWith(".deb"):
				return [theme.palette.error.main, theme.palette.error.light];
			case node.name.endsWith(".mod"):
			case node.name.endsWith(".tgz"):
			case node.name.endsWith(".tar.gz"):
			case node.name.endsWith(".apk"):
				return [theme.palette.primary.main, theme.palette.primary.light];
			default:
				return [theme.palette.text.secondary, theme.palette.action.hover];
		}
	}, [node.name]);

	const {classes} = useStyles({
		primary: colours[0],
		secondary: colours[1]
	});

	const left = depth * 20;
	const id = node.children.length === 0 ? node.item.id : `${node.item.id}-${node.name}`;

	return (
		<div
			style={style}>
			<ListItem
				button
				selected={id === selected}
				onClick={() => setSelected(id)}
				dense
				classes={{
					root: classes.root
				}}
				style={{
					position: "absolute",
					left: `${left}px`,
					width: `calc(100% - ${left}px)`
				}}>
				<ListItemIcon>
					<Icon color={colours[0]}/>
				</ListItemIcon>
				<ListItemText
					primaryTypographyProps={{className: classes.row}}>
					{unescapeString(node.name)}
				</ListItemText>
			</ListItem>
		</div>
	);
}
export default FolderTreeItem;
