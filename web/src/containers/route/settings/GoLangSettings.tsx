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

import React from "react";
import {
	Alert,
	Box,
	Card,
	Divider,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	Switch,
	Theme,
	Typography,
	useTheme,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {mdiPlus} from "@mdi/js";
import {GenericIconButton, ListItemSkeleton} from "jmp-coreui";
import useLoading from "../../../hooks/useLoading";
import useErrors from "../../../hooks/useErrors";
import getErrorMessage from "../../../selectors/getErrorMessage";

const useStyles = makeStyles()((theme: Theme) => ({
	card: {
		minHeight: "100%"
	},
	icon: {
		margin: theme.spacing(1),
		marginRight: theme.spacing(2)
	},
	text: {
		margin: theme.spacing(1),
		fontSize: 14
	}
}));

const GoLangSettings: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	// global state
	const rules: any[] = [];

	const loading = useLoading([]);
	const error = useErrors([]);

	return (
		<div
			className={classes.card}>
			<Card
				className={classes.card}>
				<Box sx={{m: 2}}>
					GoLang integration
				</Box>
				<ListItem
					disabled>
					<ListItemText
						secondary="Enables or disables the GoProxy API. Cached data will remain available but will not be retrievable by Go until turned back on.">
							Enabled
					</ListItemText>
					<ListItemSecondaryAction>
						<Switch
							disabled
							checked
						/>
					</ListItemSecondaryAction>
				</ListItem>
				<ListItem>
					<ListItemText
						secondary="Rewrite hosts as they are requested (e.g. github.com -> git.mycorp.local)">
							Host rewrite rules
					</ListItemText>
					<ListItemSecondaryAction>
						<GenericIconButton
							title="Add (disabled)"
							icon={mdiPlus}
							colour={theme.palette.text.secondary}
							disabled
						/>
					</ListItemSecondaryAction>
				</ListItem>
				<Divider/>
				{loading && <div>
					<ListItemSkeleton/>
					<ListItemSkeleton invertLengths/>
					<ListItemSkeleton/>
					<ListItemSkeleton/>
				</div>}
				{!loading && error != null && <Alert
					severity="error">
						An error occurred attempting to load rules: "{getErrorMessage(error)}"
				</Alert>}
				{!loading && error == null && rules.length === 0 && <Typography
					className={classes.text}
					align="center"
					color="textSecondary">
						No rules could be found.
				</Typography>}
				{!loading && error == null && rules.length > 0 && <List>
					{rules.map(r => <ListItem
						dense
						key={r.id}>
						<ListItemText>
							{r.source} --&gt; {r.destination}
						</ListItemText>
					</ListItem>)}
				</List>}
			</Card>
		</div>
	);
}
export default GoLangSettings;
