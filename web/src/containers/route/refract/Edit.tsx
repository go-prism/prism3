import React, {useEffect, useMemo, useState} from "react";
import {
	Button,
	Chip,
	FormGroup,
	FormLabel,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	makeStyles,
	Theme,
	Typography
} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import {Link, useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {Alert, Skeleton} from "@material-ui/lab";
import Icon from "@mdi/react";
import {useParams} from "react-router";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import useLoading from "../../../hooks/useLoading";
import useErrors from "../../../hooks/useErrors";
import getErrorMessage from "../../../selectors/getErrorMessage";
import ExpandableListItem from "../../list/ExpandableListItem";
import {MetadataChip, RefractionV1} from "../../../config/types";
import {IDParams} from "../settings";
import Setup from "./setup/Setup";

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
	chip: {
		margin: theme.spacing(0.5)
	}
}));

const initialName: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
}

const EditRefract: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const history = useHistory();
	const {id} = useParams<IDParams>();

	// global state
	const loading = useLoading([]);
	const error = useErrors([]);
	let refraction: RefractionV1 | null = null;
	let refractInfo: object | null = null;


	// local state
	const [name, setName] = useState<ValidatedData>(initialName);
	const [remotes, setRemotes] = useState<string[]>([]);
	const [success, setSuccess] = useState<boolean>(false);
	const [readOnly, setReadOnly] = useState<boolean>(false);

	const open = useMemo(() => {
		return history.location.hash.replace("#", "");
	}, [history.location.hash]);
	
	useEffect(() => {
		if (refraction == null) return;
		setName({...name, value: refraction.name});
		setRemotes(refraction.remotesList);
		// go refractions are system-managed
		setReadOnly(refraction.archetype === "golang");
	}, [refraction]);

	const handleUpdate = (): void => {
		if (refraction == null) return;
		setSuccess(false);
		// dispatch(updateRefract(id, {
		// 	archetype: refraction.archetype,
		// 	name: name.value,
		// 	remotesList: remotes
		// })).then((action) => {
		// 	// only show the alert if there was a success
		// 	if(action.error !== true) {
		// 		setSuccess(true);
		// 		dispatch(getRefract(id));
		// 	}
		// });
	}

	const chips = useMemo(() => {
		if (refractInfo == null)
			return [];
		const chipData: MetadataChip[] = [
			// {
			// 	label: refractInfo.files,
			// 	icon: mdiFileDocumentMultipleOutline
			// },
			// {
			// 	label: formatBytes(refractInfo.size),
			// 	icon: mdiDatabaseOutline
			// }
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
	}, [refractInfo]);

	const handleOpen = (id: string): void => {
		history.push({
			...history.location,
			hash: open === id ? "" : id
		});
	}

	const options = useMemo(() => {
		const data = [
			{
				id: "getting-setup",
				primary: "Getting setup",
				secondary: "Application-specific setup information.",
				children: refraction && <Setup refract={refraction}/>,
				disabled: refraction == null
			}
		];
		return data.map(d => <ExpandableListItem
			key={d.id}
			primary={d.primary}
			secondary={d.secondary}
			disabled={d.disabled}
			open={open === d.id}
			setOpen={o => handleOpen(o ? d.id : "")}>
			{d.children}
		</ExpandableListItem>);
	}, [open, refraction]);

	return (
		<StandardLayout>
			<div>
				{success && <Alert
					severity="success">
					Refraction updated successfully
				</Alert>}
				<ListItem>
					<ListItemIcon>
						{/*{loading ? <Skeleton variant="circle" animation="wave" width={48} height={48}/> : getRemoteIcon(theme, refraction?.archetype || "")}*/}
					</ListItemIcon>
					<ListItemText
						disableTypography
						secondary={<Typography
							color="textSecondary">
							{/*{loading ? <Skeleton animation="wave" width="15%"/> : `Refraction ID: ${refraction?.id}`}*/}
						</Typography>}>
						<Typography
							className={classes.title}
							color="textPrimary"
							variant="h4">
							{/*{loading ? <Skeleton animation="wave" width="25%" height={64}/> : refraction?.name}*/}
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
						This Refraction is read-only and cannot be modified.
					</Alert>}
					<ValidatedTextField
						data={name}
						setData={setName}
						invalidLabel="Must be at least 3 characters."
						fieldProps={{
							className: classes.formItem,
							required: true,
							label: "Refraction name",
							variant: "outlined",
							id: "txt-name",
							disabled: loading || readOnly
						}}
					/>
					{/*{refraction && <RemoteSelect*/}
					{/*	arch={refraction.archetype}*/}
					{/*	setRemotes={setRemotes}*/}
					{/*	defaultRemotes={refraction.remotesList}*/}
					{/*	disabled={readOnly}*/}
					{/*/>}*/}
					<List>
						{options}
					</List>
					{error != null && <Alert
						severity="error">
						Failed to update Refraction.
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
							to="/settings/refract"
							variant="outlined">
							Cancel
						</Button>
						<div className={classes.grow}/>
						<Button
							className={classes.button}
							style={{color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main}}
							disabled={!DataIsValid(name) || loading || readOnly}
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
export default EditRefract;
