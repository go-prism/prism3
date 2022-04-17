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
import {Alert, Button, FormGroup, Theme, Typography,} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Link, useHistory} from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import getErrorMessage from "../../../selectors/getErrorMessage";
import ClientConfig from "../remote/options/ClientConfig";
import {TransportSecurity, useCreateTransportMutation} from "../../../generated/graphql";

const useStyles = makeStyles()((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
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

const initialName: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^[a-zA-Z0-9_-]+$/)
}

const CreateTransport: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();

	// global state
	const [createTransport, {loading, error}] = useCreateTransportMutation();

	// local state
	const [name, setName] = useState<ValidatedData>(initialName);
	const [profile, setProfile] = useState<TransportSecurity>({
		id: "",
		name: "",
		ca: "",
		cert: "",
		key: "",
		skipTLSVerify: false,
		httpProxy: "",
		httpsProxy: "",
		noProxy: ""
	});

	const handleCreate = (): void => {
		createTransport({variables: {
			name: name.value,
			ca: profile.ca,
			cert: profile.cert,
			key: profile.key,
			skipTLSVerify: profile.skipTLSVerify,
			httpProxy: profile.httpProxy,
			httpsProxy: profile.httpsProxy,
			noProxy: profile.noProxy
		}}).then(r => {
			if (!r.errors) {
				history.push(`/settings/security/transport#${r.data?.createTransportProfile.id || ""}`);
			}
		});
	}

	return (
		<StandardLayout>
			<div>
				<Typography
					className={classes.title}
					color="textPrimary"
					variant="h4">
					Create Transport
				</Typography>
				<FormGroup
					className={classes.form}>
					<ValidatedTextField
						data={name}
						setData={setName}
						invalidLabel="Can only be alphanumeric characters, hyphen and underscore."
						fieldProps={{
							sx: {m: 1},
							required: true,
							label: "Name",
							variant: "filled",
							id: "txt-name"
						}}
					/>
					<ClientConfig
						profile={profile}
						setProfile={p => setProfile(() => p)}
					/>
					{error != null && <Alert
						severity="error">
						Failed to create Transport.
						<br/>
						<Code>
							{getErrorMessage(error)}
						</Code>
					</Alert>}
					<div
						className={`${classes.formItem} ${classes.flex}`}>
						<Button
							className={classes.button}
							component={Link}
							to="/settings/sys/acl"
							variant="outlined">
							Cancel
						</Button>
						<div className={classes.grow}/>
						<Button
							className={classes.button}
							style={{color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main}}
							disabled={loading || name.value === "" || name.error !== ""}
							onClick={handleCreate}
							variant="contained">
							Create
						</Button>
					</div>
				</FormGroup>
			</div>
		</StandardLayout>
	);
}
export default CreateTransport;
