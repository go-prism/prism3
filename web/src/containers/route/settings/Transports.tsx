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
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Box,
	Button,
	Divider,
	List,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ListItemSkeleton} from "jmp-coreui";
import {ChevronDown} from "tabler-icons-react";
import {Link, useHistory, useLocation} from "react-router-dom";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import ClientConfig from "../remote/options/ClientConfig";
import Header from "../../layout/Header";
import {TransportSecurity, useListTransportsQuery} from "../../../generated/graphql";

const useStyles = makeStyles()((theme: Theme) => ({
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

	return <Accordion
		variant="outlined"
		expanded={open}
		onChange={() => setSelected(selected === item.id ? "" : item.id)}>
		<AccordionSummary
			centerRipple={false}
			expandIcon={<ChevronDown/>}>
			<Typography>
				{item.name || "-"}
			</Typography>
		</AccordionSummary>
		<AccordionDetails>
			<Divider/>
			<Box sx={{p: 1, pr: 3}}>
				<ClientConfig
					profile={item}
					setProfile={() => {}}
					disabled={item.name === "default"}
				/>
			</Box>
		</AccordionDetails>
	</Accordion>
}

const Transports: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const location = useLocation();
	const history = useHistory();

	// global state
	const selected = location.hash.replace("#", "");
	const {data, loading, error} = useListTransportsQuery();

	const setSelected = (val: string): void => {
		history.push({...location, hash: `#${val}`});
	}

	return (
		<div
			className={classes.card}>
			<div
				className={classes.card}>
				<Header
					title="Transports"
					counter={data?.listTransports.length || 0}
					actions={<div>
						<Button
							className={classes.button}
							variant="contained"
							color="primary"
							component={Link}
							to="/settings/transport/new">
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
						item={r as TransportSecurity}
						key={r.id}
						selected={selected}
						setSelected={setSelected}
					/>)}
				</List>}
			</div>
		</div>
	);
}
export default Transports;
