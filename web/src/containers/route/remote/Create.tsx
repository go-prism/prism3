/*
 *    Copyright 2022 Django Cass
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
	Alert,
	Box,
	Button,
	FormControl,
	FormGroup,
	FormLabel,
	InputLabel,
	Link as MuiLink,
	MenuItem,
	Select,
	SelectChangeEvent,
	Theme,
	Typography
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {Link, useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {ARCHETYPE_SAMPLES, REMOTE_ARCHETYPES} from "../../../config/constants";
import {Archetype, TransportSecurity, useCreateRemoteMutation} from "../../../generated/graphql";
import Flexbox from "../../widgets/Flexbox";
import InlineBadge from "../../../components/feedback/InlineBadge";
import TransportOpts from "./options/TransportOpts";

const useStyles = makeStyles()((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		marginLeft: theme.spacing(0.5)
	},
	form: {
		marginTop: theme.spacing(1)
	},
	formItem: {
		margin: theme.spacing(1)
	},
	formIcon: {
		paddingTop: theme.spacing(1.75)
	},
	flex: {
		display: "flex"
	},
	grow: {
		flexGrow: 1
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: 600,
		textTransform: "none"
	}
}));

const initialURL: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/https?:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?(?![^<]*(?:<\/\w+>|\/?>))/)
}

const initialName: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
}

const CreateRemote: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();

	// global state
	const [createRemote, {loading, error}] = useCreateRemoteMutation();


	// local state
	const [arch, setArch] = useState<Archetype>(Archetype.Generic);
	const [url, setURL] = useState<ValidatedData>(initialURL);
	const [name, setName] = useState<ValidatedData>(initialName);
	const [transport, setTransport] = useState<TransportSecurity | null>(null);

	const handleArchChange = (e: SelectChangeEvent): void => {
		setArch(e.target.value as Archetype);
	};

	const handleCreate = (): void => {
		createRemote({variables: {
			name: name.value,
			uri: url.value,
			archetype: arch,
			transport: transport!.id
		}}).then(r => {
			if (!r.errors) {
				history.push(`/remote/${r.data?.createRemote.id}/-/edit`);
			}
		});
	}

	return (
		<StandardLayout
			size="small">
			<Box
				sx={{mt: 2}}>
				<Typography
					className={classes.title}
					color="textPrimary"
					variant="h4">
					Create remote
				</Typography>
				<FormGroup
					className={classes.form}>
					<FormLabel
						className={classes.formItem}
						component="legend">
						General
					</FormLabel>
					<ValidatedTextField
						data={name}
						setData={setName}
						invalidLabel="Must be at least 3 characters."
						fieldProps={{
							className: classes.formItem,
							required: true,
							label: "Name",
							variant: "outlined",
							id: "txt-name",
							size: "small"
						}}
					/>
					<FormControl
						className={classes.formItem}>
						<InputLabel>
							Archetype
						</InputLabel>
						<Select
							label="Archetype"
							size="small"
							value={arch || Archetype.Generic}
							onChange={handleArchChange}>
							{REMOTE_ARCHETYPES.map(a => <MenuItem
								key={a.name}
								value={a.value}>
								<Flexbox inline>
									{a.name}
									{!a.stable && <InlineBadge
										colour={theme.palette.info.main}>
										Preview
									</InlineBadge>}
								</Flexbox>
							</MenuItem>)}
						</Select>
					</FormControl>
					<ValidatedTextField
						data={url}
						setData={setURL}
						invalidLabel="Must be a valid URL."
						fieldProps={{
							className: classes.formItem,
							required: true,
							label: "URL",
							variant: "outlined",
							id: "txt-url",
							size: "small"
						}}
					/>
					<Flexbox>
						<Box sx={{flexGrow: 1}}/>
						<Typography
							variant="caption">
							<MuiLink
								href="#"
								onClick={() => setURL(s => ({...s, value: ARCHETYPE_SAMPLES[arch] || ""}))}>
								Insert sample URL
							</MuiLink>
						</Typography>
					</Flexbox>
					<TransportOpts
						onSelect={setTransport}
					/>
					{error != null && <Alert
						severity="error">
						Failed to create Remote.
						<br/>
						<Code>
							{getGraphErrorMessage(error)}
						</Code>
					</Alert>}
					<div
						className={`${classes.formItem} ${classes.flex}`}>
						<Button
							className={classes.button}
							component={Link}
							to="/remotes"
							variant="outlined">
							Cancel
						</Button>
						<div className={classes.grow}/>
						<Button
							className={classes.button}
							style={{color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main}}
							disabled={!DataIsValid(url) || !DataIsValid(name) || loading || transport == null}
							onClick={handleCreate}
							variant="contained">
							Create
						</Button>
					</div>
				</FormGroup>
			</Box>
		</StandardLayout>
	);
}
export default CreateRemote;
