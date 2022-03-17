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
	Card,
	Divider,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles,
	Switch,
	Theme,
	useTheme
} from "@material-ui/core";
import {mdiPlus} from "@mdi/js";
import {GenericIconButton, ListItemSkeleton} from "jmp-coreui";
import {Alert} from "@material-ui/lab";
import getErrorMessage, {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import useListTransports from "../../../graph/actions/remote/useListTransports";

const useStyles = makeStyles((theme: Theme) => ({
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

const Transports: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();

	// global state
	const {data, loading, error} = useListTransports();

	return (
		<div
			className={classes.card}>
			<Card
				className={classes.card}>
				{loading && <div>
					<ListItemSkeleton/>
					<ListItemSkeleton invertLengths/>
					<ListItemSkeleton/>
					<ListItemSkeleton/>
				</div>}
				{!loading && error != null && <Alert
					severity="error">
					An error occurred attempting to load transports: "{getGraphErrorMessage(error)}"
				</Alert>}
				{!loading && error == null && data?.listTransports && <List>
					{data?.listTransports.map(r => <ListItem
						dense
						key={r.id}>
						<ListItemText>
							{r.name}
						</ListItemText>
					</ListItem>)}
				</List>}
			</Card>
		</div>
	);
}
export default Transports;
