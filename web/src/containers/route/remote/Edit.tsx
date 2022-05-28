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

import React, {useEffect, useMemo, useState} from "react";
import {
	Alert,
	Button,
	Chip,
	Collapse,
	FormControlLabel,
	FormGroup,
	FormLabel,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Skeleton,
	Switch,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {useParams} from "react-router";
import {formatDistanceToNow} from "date-fns";
import {Apps, CirclePlus, Edit} from "tabler-icons-react";
import {DataIsValid} from "../../../utils/data";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import ExpandableListItem from "../../list/ExpandableListItem";
import {MetadataChip} from "../../../config/types";
import {IDParams} from "../settings";
import {getRemoteIcon} from "../../../utils/remote";
import {Archetype, AuthMode, useGetRemoteLazyQuery, usePatchRemoteMutation} from "../../../generated/graphql";
import ResourceRoleViewer from "../acl/ResourceRoleViewer";
import RestrictedHeaders from "./options/RestrictedHeaders";
import FirewallRules from "./options/FirewallRules";
import TransportOpts from "./options/TransportOpts";

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
	},
	buttonDisabled: {
		backgroundColor: theme.palette.action.disabled,
		color: theme.palette.getContrastText(theme.palette.action.disabled)
	},
	chip: {
		margin: theme.spacing(0.5)
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

const EditRemote: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();
	const {id} = useParams<IDParams>();

	// global state
	const [getRemote, getData] = useGetRemoteLazyQuery();
	const [patchRemote, patchData] = usePatchRemoteMutation();
	const {data} = getData;
	const loading = getData.loading || patchData.loading;

	// local state
	const [url, setURL] = useState<ValidatedData>(initialURL);
	const [name, setName] = useState<ValidatedData>(initialName);
	const [success, setSuccess] = useState<boolean>(false);
	const [enabled, setEnabled] = useState<boolean>(false);
	const [allowList, setAllowList] = useState<string[]>([]);
	const [blockList, setBlockList] = useState<string[]>([]);
	const [resHeaders, setResHeaders] = useState<string[]>([]);
	const [directHeader, setDirectHeader] = useState<string>("");
	const [directToken, setDirectToken] = useState<string>("");
	const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.None);
	const [readOnly, setReadOnly] = useState<boolean>(false);

	const open = useMemo(() => {
		return history.location.hash.replace("#", "");
	}, [history.location.hash]);

	useEffect(() => {
		void getRemote({variables: {id: id}});
	}, [id]);

	const chips = useMemo(() => {
		const chipData: MetadataChip[] = [
			{
				label: data?.getRemote?.archetype?.toLocaleLowerCase() || Archetype.Generic,
				icon: Apps
			},
			{
				label: formatDistanceToNow(new Date((data?.getRemote?.createdAt || 0) * 1000), {addSuffix: true}),
				icon: CirclePlus
			},
			{
				label: formatDistanceToNow(new Date((data?.getRemote?.updatedAt || 0) * 1000), {addSuffix: true}),
				icon: Edit
			},
		];
		return chipData.map(c => <Chip
			className={classes.chip}
			key={c.icon.name}
			label={c.label}
			icon={<c.icon color={theme.palette.text.secondary}/>}
			size="small"
		/>);
	}, [data?.getRemote]);

	useEffect(() => {
		if (data?.getRemote == null)
			return;
		setName({...name, value: data?.getRemote.name});
		setURL({...url, value: data?.getRemote.uri});
		setEnabled(data?.getRemote.enabled);
		setAuthMode(data?.getRemote.security.authMode || AuthMode.None);
		setAllowList(data?.getRemote.security.allowed || []);
		setBlockList(data?.getRemote.security.blocked || []);
		setResHeaders(data?.getRemote.security.authHeaders || []);
		setDirectHeader(data?.getRemote.security.directHeader || "");
		setDirectToken(data?.getRemote.security.directToken || "");
		setReadOnly(data?.getRemote.archetype === Archetype.Go);
	}, [data?.getRemote]);

	const hasChanged = (): boolean => {
		if (data?.getRemote == null)
			return false;
		if (name.value !== data?.getRemote.name)
			return true;
		if (url.value !== data?.getRemote.uri)
			return true;
		if (allowList !== data?.getRemote.security.allowed)
			return true;
		if (blockList !== data?.getRemote.security.blocked)
			return true;
		if (resHeaders !== data?.getRemote.security.authHeaders)
			return true;
		if (authMode !== data?.getRemote.security.authMode)
			return true;
		if (directHeader !== data?.getRemote.security.directHeader)
			return true;
		if (directToken !== data?.getRemote.security.directToken)
			return true;
		return enabled !== data?.getRemote.enabled;
	};

	const handleUpdate = (): void => {
		if (data == null)
			return;
		setSuccess(() => false);
		patchRemote({variables: {
			id: data.getRemote.id,
			transportID: data.getRemote.transport.id,
			allowed: allowList,
			blocked: blockList,
			authMode: authMode,
			directHeader: directHeader,
			directToken: directToken,
			authHeaders: resHeaders
		}}).then(r => {
			if (!r.errors) {
				setSuccess(() => true);
			}
		});
	}

	const handleOpen = (id: string): void => {
		history.push({
			...history.location,
			hash: open === id ? "" : id
		});
	}

	const getOptions = () => {
		const items = [
			{
				id: "firewall-rules",
				primary: "Firewall rules",
				secondary: "Firewall rules define when this remote should be used or skipped.",
				children: <FirewallRules
					allowRules={allowList}
					blockRules={blockList}
					setAllowRules={setAllowList}
					setBlockRules={setBlockList}
					loading={loading}
					disabled={readOnly}
				/>
			},
			{
				id: "authorization",
				primary: "Authorisation",
				secondary: "Control the behaviour of cache partitioning and remote authentication.",
				children: <RestrictedHeaders
					headers={resHeaders}
					setHeaders={setResHeaders}
					directHeader={directHeader}
					setDirectHeader={setDirectHeader}
					directToken={directToken}
					setDirectToken={setDirectToken}
					authMode={authMode}
					setAuthMode={setAuthMode}
					loading={loading}
					disabled={readOnly}
				/>
			},
			{
				id: "transport",
				primary: "HTTP/TLS/Proxy options",
				secondary: "Configure how Prism communicates with remotes.",
				children: data?.getRemote == null ? "" : <TransportOpts
					disabled={readOnly}
					onSelect={() => {}}
				/>
			},
			{
				id: "rbac",
				primary: "Permissions",
				secondary: "",
				children: data?.getRemote == null ? "" : <ResourceRoleViewer type="remote" id={data.getRemote.name}/>
			}
		];
		return items.map(d => <ExpandableListItem
			key={d.id}
			primary={d.primary}
			secondary={d.secondary}
			open={open === d.id}
			setOpen={o => {
				handleOpen(o ? d.id : "");
			}}>
			{d.children}
		</ExpandableListItem>);
	};

	return (
		<div>
			{getData.error != null && <Alert
				severity="error">
				Failed to fetch Remote.
				<br/>
				<Code>
					{getGraphErrorMessage(getData.error)}
				</Code>
			</Alert>}
			{success && <Alert
				severity="success">
				Remote updated successfully
			</Alert>}
			<ListItem>
				<ListItemIcon>
					{loading ? <Skeleton variant="circular" animation="wave" width={48} height={48}/> : getRemoteIcon(theme, data?.getRemote?.archetype || Archetype.Generic)}
				</ListItemIcon>
				<ListItemText
					disableTypography
					secondary={<Typography
						color="textSecondary">
						{loading ? <Skeleton animation="wave" width="15%"/> : `Remote ID: ${data?.getRemote?.id}`}
					</Typography>}>
					<Typography
						className={classes.title}
						color="textPrimary"
						variant="h4">
						{loading ? <Skeleton animation="wave" width="25%" height={64}/> : data?.getRemote?.name}
					</Typography>
				</ListItemText>
			</ListItem>
			<FormGroup
				className={classes.form}>
				<div>
					{loading ? <Skeleton
						animation="wave"
						width="35%"
						height={32}
					/> : chips}
				</div>
				<FormLabel
					className={classes.formItem}
					component="legend">
					General
				</FormLabel>
				{!loading && readOnly && <Alert
					severity="warning">
					This Remote is read-only and cannot be modified.
				</Alert>}
				<ValidatedTextField
					data={name}
					setData={setName}
					invalidLabel="Must be at least 3 characters."
					fieldProps={{
						className: classes.formItem,
						required: true,
						label: "Remote name",
						variant: "filled",
						id: "txt-name",
						disabled: loading || readOnly
					}}
				/>
				<ValidatedTextField
					data={url}
					setData={setURL}
					invalidLabel="Must be a valid URL."
					fieldProps={{
						className: classes.formItem,
						required: true,
						label: "Remote URL",
						variant: "filled",
						id: "txt-url",
						disabled: loading || readOnly
					}}
				/>
				<FormControlLabel
					className={classes.formItem}
					control={<Switch
						color="primary"
						checked={enabled}
						disabled={readOnly}
						onChange={(_, checked) => setEnabled(checked)}
					/>}
					label="Enabled"
				/>
				<Collapse
					in={data?.getRemote != null && !enabled && enabled !== data.getRemote?.enabled}>
					<Alert
						className={classes.formItem}
						severity="warning">
						Disabling a remote stops new data from being fetched from it.
						Data that has already been downloaded and cached will still be available.
					</Alert>
				</Collapse>
				<List>
					{getOptions()}
				</List>
				{patchData.error != null && <Alert
					severity="error">
						Failed to update Remote.
					<br/>
					<Code>
						{getGraphErrorMessage(patchData.error)}
					</Code>
				</Alert>}
				<div
					className={`${classes.formItem} ${classes.flex}`}>
					<div className={classes.grow}/>
					<Button
						className={classes.button}
						color="primary"
						classes={{
							disabled: classes.buttonDisabled
						}}
						disabled={!DataIsValid(url) || !DataIsValid(name) || loading || !hasChanged() || readOnly}
						onClick={handleUpdate}
						variant="contained">
						Save changes
					</Button>
				</div>
			</FormGroup>
		</div>
	);
}
export default EditRemote;
