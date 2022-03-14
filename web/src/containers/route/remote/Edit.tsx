import React, {useEffect, useMemo, useState} from "react";
import {
	Button,
	Chip,
	FormControlLabel,
	FormGroup,
	FormLabel,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	makeStyles,
	Switch,
	Theme,
	Typography
} from "@material-ui/core";
import Icon from "@mdi/react";
import {mdiPencilOutline, mdiPlusCircleOutline, mdiShapeOutline} from "@mdi/js";
import {useTheme} from "@material-ui/core/styles";
import {Link, useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {Alert, Skeleton} from "@material-ui/lab";
import {UpdateProfileRequest} from "@prism/prism-rpc/build/gen/service/api/remote_pb";
import {useParams} from "react-router";
import {formatDistanceToNow} from "date-fns";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import getErrorMessage, {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import ExpandableListItem from "../../list/ExpandableListItem";
import {MetadataChip} from "../../../config/types";
import {IDParams} from "../settings";
import useGetRemote from "../../../graph/actions/remote/useGetRemote";
import {Archetype} from "../../../graph/types";
import {getRemoteIcon} from "../../../utils/remote";
import RestrictedHeaders from "./options/RestrictedHeaders";
import FirewallRules from "./options/FirewallRules";
import {CLIENT_PROFILE_DEFAULT} from "./options/ClientConfig";

const useStyles = makeStyles((theme: Theme) => ({
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
	const classes = useStyles();
	const theme = useTheme();
	const history = useHistory();
	const {id} = useParams<IDParams>();

	// global state
	const [getRemote, {data, loading, error}] = useGetRemote();

	// local state
	const [url, setURL] = useState<ValidatedData>(initialURL);
	const [name, setName] = useState<ValidatedData>(initialName);
	const [success, setSuccess] = useState<boolean>(false);
	const [enabled, setEnabled] = useState<boolean>(false);
	const [stripRestricted, setStripRestricted] = useState<boolean>(false);
	const [resHeaders, setResHeaders] = useState<string[]>([]);
	const [allowList, setAllowList] = useState<string[]>([]);
	const [blockList, setBlockList] = useState<string[]>([]);
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
				label: data?.getRemote?.archetype || Archetype.NONE,
				icon: mdiShapeOutline
			},
			{
				label: formatDistanceToNow(new Date((data?.getRemote?.createdAt || 0) * 1000), {addSuffix: true}),
				icon: mdiPlusCircleOutline
			},
			{
				label: formatDistanceToNow(new Date((data?.getRemote?.updatedAt || 0) * 1000), {addSuffix: true}),
				icon: mdiPencilOutline
			},
		];
		return chipData.map(c => <Chip
			className={classes.chip}
			key={c.icon}
			label={c.label}
			icon={<Icon
				path={c.icon}
				size={0.75}
				color={theme.palette.text.secondary}
			/>}
			size="small"
		/>);
	}, [data?.getRemote]);

	useEffect(() => {
		if (data?.getRemote == null)
			return;
		setName({...name, value: data?.getRemote.name});
		setURL({...url, value: data?.getRemote.uri});
		setEnabled(data?.getRemote.enabled);
		// setResHeaders(data?.getRemote.security.authHeaders || []);
		// setAllowList(data?.getRemote.security.allowed || []);
		// setBlockList(data?.getRemote.security.blocked || []);
		setReadOnly(data?.getRemote.archetype === Archetype.GO);
	}, [data?.getRemote]);

	const hasChanged = (): boolean => {
		if (data?.getRemote == null)
			return false;
		if (name.value !== data?.getRemote.name)
			return true;
		if (url.value !== data?.getRemote.uri)
			return true;
		return enabled !== data?.getRemote.enabled;
	};

	const handleUpdate = (): void => {
		// if (remote == null) return;
		// setSuccess(false);
		// dispatch(updateRemote(id, {
		// 	allowlistList: allowList,
		// 	blocklistList: blockList,
		// 	archetype: remote.archetype,
		// 	name: name.value,
		// 	uri: url.value,
		// 	enabled: enabled,
		// 	striprestricted: stripRestricted,
		// 	restrictedheadersList: resHeaders,
		// 	clientprofile: profile
		// })).then((action) => {
		// 	// only show the alert if there was a success
		// 	if(action.error !== true) {
		// 		setSuccess(true);
		// 		// reload the remote
		// 		dispatch(getRemote(id));
		// 	}
		// });
	}

	const handleOpen = (id: string): void => {
		history.push({
			...history.location,
			hash: open === id ? "" : id
		});
	}

	const getOptions = () => {
		const data = [
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
				id: "restricted-headers",
				primary: "Restricted headers",
				secondary: "Restricted headers control the behaviour of cache partitioning and remote authentication.",
				children: <RestrictedHeaders
					stripRestricted={stripRestricted}
					setStripRestricted={setStripRestricted}
					restrictedHeaders={resHeaders}
					setRestrictedHeaders={setResHeaders}
					loading={loading}
					disabled={readOnly}
				/>
			},
			{
				id: "transport",
				primary: "HTTP/TLS/Proxy options",
				secondary: "Configure how Prism communicates with remotes.",
				children: <div/>
			}
		];
		return data.map(d => <ExpandableListItem
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
		<StandardLayout>
			<div>
				{error != null && <Alert
					severity="error">
					Failed to fetch Remote.
					<br/>
					<Code>
						{getGraphErrorMessage(error)}
					</Code>
				</Alert>}
				{success && <Alert
					severity="success">
					Remote updated successfully
				</Alert>}
				<ListItem>
					<ListItemIcon>
						{loading ? <Skeleton variant="circle" animation="wave" width={48} height={48}/> : getRemoteIcon(theme, data?.getRemote?.archetype || Archetype.NONE)}
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
							variant: "outlined",
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
							variant: "outlined",
							id: "txt-url",
							disabled: loading || readOnly
						}}
					/>
					{/*<Collapse*/}
					{/*	in={remote != null && !enabled && enabled !== remote?.enabled}>*/}
					{/*	<Alert*/}
					{/*		className={classes.formItem}*/}
					{/*		severity="warning">*/}
					{/*		Disabling a remote stops new data from being fetched from it.*/}
					{/*		Data that has already been downloaded and cached will still be available.*/}
					{/*	</Alert>*/}
					{/*</Collapse>*/}
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
					<List>
						{getOptions()}
					</List>
					{error != null && <Alert
						severity="error">
						Failed to update Remote.
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
							to="/settings/remotes"
							variant="outlined">
							Cancel
						</Button>
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
		</StandardLayout>
	);
}
export default EditRemote;
