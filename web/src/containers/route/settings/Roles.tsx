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

import {
	Card,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	ListSubheader,
	Theme,
	useTheme,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import React from "react";
import Icon from "@mdi/react";
import {mdiAccountMultipleOutline, mdiChevronRight} from "@mdi/js";
import {Link} from "react-router-dom";

const useStyles = makeStyles()((theme: Theme) => ({
	item: {
		padding: theme.spacing(1)
	}
}));

const Roles: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	return (
		<div>
			<ListSubheader>User management</ListSubheader>
			<Card>
				<ListItem
					button
					component={Link}
					to="/settings/acl">
					<ListItemIcon>
						<Icon
							path={mdiAccountMultipleOutline}
							color={theme.palette.text.secondary}
							size={1}
			            />
					</ListItemIcon>
					<ListItemText
						className={classes.item}
						secondary="View and manage the type of access and resources that users are allowed.">
						Access control
					</ListItemText>
					<ListItemSecondaryAction>
						<Icon
							path={mdiChevronRight}
							size={1}
							color={theme.palette.text.secondary}
						/>
					</ListItemSecondaryAction>
				</ListItem>
			</Card>
		</div>
	);
}
export default Roles;
