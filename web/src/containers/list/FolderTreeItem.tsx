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
import {FileCode, Folder} from "tabler-icons-react";
import {unescapeString} from "../../utils/encode";
import {Node} from "../route/Overview";
import {Artifact} from "../../generated/graphql";
import {getNodeColour, getNodeIcon} from "../../utils/remote";

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
			case node.name.endsWith(".pom"):
			case node.name.endsWith(".sha1"):
			case node.name.endsWith(".jar"):
			case node.name.endsWith(".tgz"):
			case node.name.endsWith(".tar.gz"):
			case node.name.endsWith(".apk"):
			case node.name.endsWith(".deb"):
			case node.name.endsWith(".zip"):
			case node.name.endsWith(".mod"):
			case node.name.endsWith(".whl"):
				return getNodeIcon(node.name);
			default:
				return node.children.length === 0 ? FileCode : Folder;
		}
	}, [node.name]);

	const colours = useMemo(() => {
		return getNodeColour(theme, node.name);
	}, [node.name, theme.palette.mode]);

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
