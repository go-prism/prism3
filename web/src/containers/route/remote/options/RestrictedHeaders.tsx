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

import React, {useEffect, useState} from "react";
import {
	Alert,
	Box,
	Collapse,
	FormControl,
	FormControlLabel,
	FormLabel,
	IconButton,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	ListSubheader,
	Radio,
	RadioGroup,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {GenericIconButton, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {Plus} from "tabler-icons-react";
import {mdiDeleteOutline} from "@mdi/js";
import {useTheme} from "@mui/material/styles";
import {AuthMode} from "../../../../generated/graphql";
import InlineNotFound from "../../../widgets/InlineNotFound";
import Flexbox from "../../../widgets/Flexbox";
import TextEntryModal from "../../../../components/modal/TextEntryModal";

const useStyles = makeStyles()((theme: Theme) => ({
	button: {
		textTransform: "none",
		fontFamily: "Manrope",
		fontWeight: 600,
		marginTop: theme.spacing(1)
	},
	text: {
		margin: theme.spacing(1)
	}
}));

interface RestrictedHeadersProps {
	headers: string[];
	setHeaders: (v: string[]) => void;
	directHeader: string;
	setDirectHeader: (s: string) => void;
	directToken: string;
	setDirectToken: (s: string) => void;
	authMode: AuthMode;
	setAuthMode: (m: AuthMode) => void;
	loading?: boolean;
	disabled?: boolean;
}

const initialHeader: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^([-!#-'*+.0-9A-Z^-z|~]+)/)
}

const initialValue: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/.+/)
}

const RestrictedHeaders: React.FC<RestrictedHeadersProps> = ({
	headers,
	setHeaders,
	directHeader,
	setDirectHeader,
	directToken,
	setDirectToken,
	authMode,
	setAuthMode,
	loading,
	disabled = false
}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {classes} = useStyles();

	const [dHeader, setDHeader] = useState<ValidatedData>({...initialHeader, value: directHeader});
	const [directValue, setDirectValue] = useState<ValidatedData>(initialValue);

	const [addProxyHeader, setAddProxyHeader] = useState<ValidatedData>({...initialHeader, value: directToken});
	const [openHeaderModal, setOpenHeaderModal] = useState<boolean>(false);

	useEffect(() => {
		if (dHeader.error === "") {
			setDirectHeader(dHeader.value);
		}
		if (directValue.error === "") {
			setDirectToken(directValue.value);
		}
	}, [dHeader, directValue]);

	return (
		<div>
			<Typography
				className={classes.text}
				color="textSecondary"
				variant="body2">
				Authentication headers are hashed to create a "unique" cache partition for individual requests.
				By default, authentication information is removed entirely so that you can anonymously retrieve artifacts from remotes that target public sources (e.g. Maven Central).
			</Typography>
			<ListItem>
				<FormControl
					disabled={disabled || loading}>
					<FormLabel>Authentication mode</FormLabel>
					<RadioGroup
						value={authMode}
						onChange={(event, value) => setAuthMode(value as AuthMode)}>
						<FormControlLabel
							value={AuthMode.None}
							control={<Radio/>}
							label="None"
						/>
						<FormControlLabel
							value={AuthMode.Proxy}
							control={<Radio/>}
							label="Pass-through"
						/>
						<FormControlLabel
							value={AuthMode.Direct}
							control={<Radio/>}
							label="Direct"
						/>
					</RadioGroup>
				</FormControl>
			</ListItem>
			<Collapse
				in={authMode === AuthMode.None}>
				<Alert
					severity="warning">
					With authentication disabled, only anonymous artifacts will be retrievable from this remote.
				</Alert>
			</Collapse>
			<Flexbox>
				{authMode !== AuthMode.None && <ListSubheader>
					{authMode === AuthMode.Proxy ? "Pass-through configuration" : "Direct configuration"}
				</ListSubheader>}
				<Box sx={{flexGrow: 1}}/>
				{authMode === AuthMode.Proxy && <React.Fragment>
					<IconButton
						size="small"
						centerRipple={false}
						onClick={() => setOpenHeaderModal(() => true)}>
						<Plus/>
					</IconButton>
					<TextEntryModal
						open={openHeaderModal}
						setOpen={setOpenHeaderModal}
						title="Add header"
						description="Set an HTTP header that Prism will proxy to this Remote (e.g. Private-Token). Headers are case-insensitive."
						disabled={disabled || loading}
						invalidLabel="Value must be a valid HTTP header"
						value={addProxyHeader}
						setValue={setAddProxyHeader}
						onConfirm={() => {
							if (headers.find(h => h === addProxyHeader.value))
								return;
							setHeaders([...headers, addProxyHeader.value]);
							setAddProxyHeader(() => initialHeader);
						}}
					/>
				</React.Fragment>}
			</Flexbox>
			{authMode === AuthMode.Proxy && <List>
				{headers.length === 0 && <InlineNotFound
					title="No headers set"
				/>}
				{headers.map(h => <ListItem
					key={h}
					dense>
					<ListItemText>
						{h}
					</ListItemText>
					<ListItemSecondaryAction>
						<GenericIconButton
							size="small"
							title="Remove"
							icon={mdiDeleteOutline}
							colour={theme.palette.text.secondary}
							onClick={() => {
								setHeaders(headers.filter(i => i !== h));
							}}
						/>
					</ListItemSecondaryAction>
				</ListItem>)}
			</List>}
			{authMode === AuthMode.Direct && <Box
				sx={{ml: 2, mr: 2}}>
				<ValidatedTextField
					data={dHeader}
					setData={setDHeader}
					invalidLabel="Must be a valid HTTP header"
					fieldProps={{
						required: true,
						label: "Header",
						variant: "filled",
						id: "txt-header",
						fullWidth: true,
						disabled: loading || disabled,
						placeholder: "Authorization"
					}}
				/>
				<ValidatedTextField
					data={directValue}
					setData={setDirectValue}
					invalidLabel="Must be set"
					fieldProps={{
						sx: {mt: 1},
						required: true,
						label: "Token",
						variant: "filled",
						id: "txt-token",
						fullWidth: true,
						disabled: loading || disabled,
						placeholder: "Basic admin:hunter2"
					}}
				/>
			</Box>}
		</div>
	);
}
export default RestrictedHeaders;
