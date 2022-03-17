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

import React, {useEffect} from "react";
import {Button, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import {Alert} from "@material-ui/lab";
import {TreeNode} from "../list/FolderTreeItem";
import {getRemoteIcon} from "../../utils/remote";
import StandardLayout from "../layout/StandardLayout";
import {RefractionV1} from "../../config/types";
import useListRefractions from "../../graph/actions/remote/useListRefractions";

export interface Node {
	node: TreeNode;
	hasChildren: boolean;
	depth: number;
	collapsed: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		borderRadius: theme.spacing(4)
	}
}));

interface OverviewParams {
	ref?: string;
}

const Overview: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {ref} = useParams<OverviewParams>();
	const classes = useStyles();

	// global state
	const {data, loading, error} = useListRefractions();

	useEffect(() => {
		window.document.title = "Prism";
	}, []);
	
	return (
		<StandardLayout>
			<List>
				{ref == null && data?.listRefractions.length === 0 && <Alert
					action={<Button
						component={Link}
						to="/refract/new"
						color="inherit"
						size="small">
						Create
					</Button>}
					severity="info">
					There are no refractions.
				</Alert>}
				{ref == null && data?.listRefractions.map(r => <ListItem
					key={r.id}
					classes={{
						root: classes.root
					}}
					button
					component={Link}
					to={`/-/${r.id}`}>
					<ListItemIcon>
						{getRemoteIcon(theme, r.archetype)}
					</ListItemIcon>
					<ListItemText>
						{r.name}
					</ListItemText>
				</ListItem>)}
			</List>
		</StandardLayout>
	);
}
export default Overview;
