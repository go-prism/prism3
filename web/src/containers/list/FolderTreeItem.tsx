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

import Icon from "@mdi/react";
import {
	mdiCpu64Bit,
	mdiDatabase,
	mdiDebian,
	mdiFolder,
	mdiFolderZipOutline,
	mdiHexagonSlice6,
	mdiLanguageJava,
	mdiSignatureFreehand,
	mdiXml,
	mdiZipBox
} from "@mdi/js";
import React, {CSSProperties, useMemo} from "react";
import {useTheme} from "@material-ui/core/styles";
import {ListItem, ListItemIcon, ListItemText, makeStyles, Theme} from "@material-ui/core";
import {CacheEntryV1} from "../../config/types";
import {unescapeString} from "../../utils/encode";
import {Node} from "../route/Overview";

interface StyleProps {
	primary: string;
	secondary: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
	root: props => ({
		borderBottomLeftRadius: theme.spacing(4),
		borderTopLeftRadius: theme.spacing(4),
		color: props.primary,
	})
}));

export interface TreeNode {
	id: string;
	name: string;
	item: CacheEntryV1;
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

	const icon = useMemo(() => {
		switch (true) {
			case node.name === "x86_64":
				return mdiCpu64Bit;
			case node.name === "APKINDEX.tar.gz":
				return mdiDatabase;
			case node.name.endsWith(".pom"):
				return mdiXml;
			case node.name.endsWith(".sha1"):
				return mdiSignatureFreehand;
			case node.name.endsWith(".jar"):
				return mdiLanguageJava;
			case node.name.endsWith(".tgz"):
			case node.name.endsWith(".tar.gz"):
			case node.name.endsWith(".apk"):
				return mdiZipBox;
			case node.name.endsWith(".deb"):
				return mdiDebian;
			case node.name.endsWith(".zip"):
				return mdiFolderZipOutline;
			case node.name.endsWith(".mod"):
				return mdiHexagonSlice6;
			default:
				return mdiFolder;
		}
	}, [node.name]);

	const colours = useMemo(() => {
		switch (true) {
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

	const classes = useStyles({
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
					<Icon
						path={icon}
						size={1}
						color={colours[0]}
					/>
				</ListItemIcon>
				<ListItemText>
					{unescapeString(node.name)}
				</ListItemText>
			</ListItem>
		</div>
	);
}
export default FolderTreeItem;
