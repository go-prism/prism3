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
import {Card, Divider, IconButton, ListItem, ListItemText, makeStyles, Theme, useTheme} from "@material-ui/core";
import {mdiArrowLeft} from "@mdi/js";
import Icon from "@mdi/react";
import {Link} from "react-router-dom";
import {ListItemSkeleton} from "jmp-coreui";
import {Alert} from "@material-ui/lab";
import {ReactorStatus} from "@prism/prism-rpc/build/gen/domain/v1/reactor_pb";
import StandardLayout from "../../layout/StandardLayout";
import useLoading from "../../../hooks/useLoading";
import useErrors from "../../../hooks/useErrors";
import getErrorMessage from "../../../selectors/getErrorMessage";

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

const ReactorSettings: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();

	// global state
	let reactorStatus: ReactorStatus.AsObject | null = null;

	const loading = useLoading([]);
	const error = useErrors([]);

	return (
		<StandardLayout>
			<div
				className={classes.card}>
				<Card
					className={classes.card}>
					<div>
						<IconButton
							className={classes.icon}
							component={Link}
							to="/settings">
							<Icon
								path={mdiArrowLeft}
								size={0.8}
								color={theme.palette.text.secondary}
						    />
						</IconButton>
						Reactor status
					</div>
					<ListItem>
						<ListItemText
							secondary="The Reactor is the workhorse that fetches requested data and stores it safely and securely.
							Data is not stored in the Reactor, so it can be discarded safely (e.g. in a Kubernetes environment).
							You should run more than one instance to ensure system continuity and stability.">
							Reactors
						</ListItemText>
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
						An error occurred attempting to load Reactors: "{getErrorMessage(error)}"
					</Alert>}
					{/*{!loading && error == null && reactorStatus?.statusesList?.length === 0 && <Typography*/}
					{/*	className={classes.text}*/}
					{/*	align="center"*/}
					{/*	color="textSecondary">*/}
					{/*	No Reactors could be found. Prism will be unable to retrieve or save data.*/}
					{/*</Typography>}*/}
					{/*{!loading && error == null && reactorStatus != null && <List>*/}
					{/*	{reactorStatus?.statusesList.map(r => {*/}
					{/*		const dx = (Date.now() / 1000) - r.time;*/}
					{/*		let stale = false;*/}
					{/*		if (dx > 300) {*/}
					{/*			stale = true;*/}
					{/*		}*/}
					{/*		return <ListItem*/}
					{/*			dense*/}
					{/*			key={r.id}>*/}
					{/*			<ListItemIcon>*/}
					{/*				<Icon*/}
					{/*					path={mdiCircle}*/}
					{/*					size={1}*/}
					{/*					color={stale ? theme.palette.text.secondary : theme.palette.success.main}*/}
					{/*				/>*/}
					{/*			</ListItemIcon>*/}
					{/*			<ListItemText*/}
					{/*				secondary={<>*/}
					{/*					Last seen <Moment fromNow unix>{r.time}</Moment>*/}
					{/*				</>}>*/}
					{/*				{r.name}*/}
					{/*			</ListItemText>*/}
					{/*		</ListItem>*/}
					{/*	})}*/}
					{/*</List>}*/}
				</Card>
			</div>
		</StandardLayout>
	);
}
export default ReactorSettings;
