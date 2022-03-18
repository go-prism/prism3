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

import React, {useState} from "react";
import {
	Button,
	Card,
	Collapse,
	IconButton,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles, Theme
} from "@material-ui/core";
import {ListItemSkeleton} from "jmp-coreui";
import {Alert} from "@material-ui/lab";
import {ChevronDown, ChevronUp} from "tabler-icons-react";
import {useHistory, useLocation} from "react-router-dom";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import useListTransports from "../../../graph/actions/remote/useListTransports";
import {TransportSecurity} from "../../../graph/types";
import ClientConfig from "../remote/options/ClientConfig";
import Header from "../../layout/Header";

const useStyles = makeStyles((theme: Theme) => ({
	card: {
		minHeight: "100%"
	},
	button: {
		margin: theme.spacing(1)
	}
}));

interface TransportItemProps {
	item: TransportSecurity;
	selected: string;
	setSelected: (val: string) => void;
}

const TransportItem: React.FC<TransportItemProps> = ({item, selected, setSelected}): JSX.Element => {
	const open = selected === item.id;
	return <div>
		<ListItem
			selected={open}
			button
			onClick={() => setSelected(open ? "" : item.id)}
			dense>
			<ListItemText>
				{item.name || "-"}
			</ListItemText>
			<ListItemSecondaryAction>
				<IconButton
					size="small"
					centerRipple={false}>
					{open ? <ChevronUp/> : <ChevronDown/>}
				</IconButton>
			</ListItemSecondaryAction>
		</ListItem>
		<Collapse in={open}>
			<ClientConfig
				profile={item}
				setProfile={() => {}}
				disabled={item.name === "default"}
			/>
		</Collapse>
	</div>
}

const Transports: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const location = useLocation();
	const history = useHistory();

	// global state
	const selected = location.hash.replace("#", "");
	const {data, loading, error} = useListTransports();

	const setSelected = (val: string): void => {
		history.push({...location, hash: `#${val}`});
	}

	return (
		<div
			className={classes.card}>
			<Card
				className={classes.card}>
				<Header
					title="Transports"
					counter={data?.listTransports.length || 0}
					actions={<div>
						<Button
							className={classes.button}
							variant="contained"
							color="primary">
							New
						</Button>
					</div>}
				/>
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
					{data?.listTransports.map(r => <TransportItem
						item={r}
						key={r.id}
						selected={selected}
						setSelected={setSelected}
					/>)}
				</List>}
			</Card>
		</div>
	);
}
export default Transports;