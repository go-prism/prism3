import React, {useEffect, useMemo, useState} from "react";
import {Alert, Button, Chip, FormGroup, FormLabel, List, Skeleton, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {useParams} from "react-router";
import {DataIsValid} from "../../../utils/data";
import getErrorMessage from "../../../selectors/getErrorMessage";
import ExpandableListItem from "../../list/ExpandableListItem";
import {MetadataChip} from "../../../config/types";
import {IDParams} from "../settings";
import RefractHeader from "../../widgets/RefractHeader";
import {
	Archetype,
	Refraction,
	Remote,
	useGetRefractionLazyQuery,
	usePatchRefractMutation
} from "../../../generated/graphql";
import Setup from "./options/Setup";
import RemoteSelect from "./RemoteSelect";
import RefractAuth from "./options/RefractAuth";

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
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();
	const {id} = useParams<IDParams>();

	// global state
	const [patchRefraction, {error: patchErr}] = usePatchRefractMutation();
	const [getRefraction, {data, loading}] = useGetRefractionLazyQuery();
	let refractInfo: object | null = null;


	// local state
	const [name, setName] = useState<ValidatedData>(initialName);
	const [remotes, setRemotes] = useState<Remote[]>([]);
	const [success, setSuccess] = useState<boolean>(false);
	const [readOnly, setReadOnly] = useState<boolean>(false);

	const open = useMemo(() => {
		return history.location.hash.replace("#", "");
	}, [history.location.hash]);

	useEffect(() => {
		void getRefraction({variables: {id: id}});
	}, [id]);
	
	useEffect(() => {
		if (data?.getRefraction == null)
			return;
		setName({...name, value: data.getRefraction.name});
		setRemotes(data.getRefraction.remotes as Remote[]);
		// go refractions are system-managed
		setReadOnly(data.getRefraction.archetype === Archetype.Go);
	}, [data?.getRefraction]);

	const handleUpdate = (): void => {
		if (!id)
			return;
		setSuccess(false);
		patchRefraction({variables: {
			id: id,
			name: name.value,
			remotes: remotes.map(r => r.id)
		}}).then(r => {
			if (!r.errors) {
				setSuccess(true);
				void getRefraction({variables: {id: id}});
			}
		});
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
			key={c.icon.name}
			label={c.label}
			icon={<c.icon color={theme.palette.text.secondary}/>}
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
		const items = [
			{
				id: "getting-setup",
				primary: "Getting setup",
				secondary: "Application-specific setup information.",
				children: data?.getRefraction && <Setup refract={data.getRefraction as Refraction}/>,
				disabled: data?.getRefraction == null || loading
			},
			{
				id: "authentication",
				primary: "Authentication",
				secondary: "Restrict and control access to protected resources.",
				children: <RefractAuth/>,
				disabled: data?.getRefraction == null || loading
			}
		];
		return items.map(d => <ExpandableListItem
			key={d.id}
			primary={d.primary}
			secondary={d.secondary}
			disabled={d.disabled}
			open={open === d.id}
			setOpen={o => handleOpen(o ? d.id : "")}>
			{d.children}
		</ExpandableListItem>);
	}, [open, data?.getRefraction]);

	return (
		<div>
			{success && <Alert
				severity="success">
					Refraction updated successfully
			</Alert>}
			<RefractHeader
				refraction={data?.getRefraction ? data.getRefraction as Refraction : null}
				loading={loading}
			/>
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
						variant: "filled",
						id: "txt-name",
						disabled: loading || readOnly
					}}
				/>
				{data?.getRefraction && <RemoteSelect
					arch={data.getRefraction.archetype}
					setRemotes={setRemotes}
					defaultRemotes={data.getRefraction.remotes as Remote[]}
					disabled={readOnly}
				/>}
				<List>
					{options}
				</List>
				{patchErr != null && <Alert
					severity="error">
						Failed to update Refraction.
					<br/>
					<Code>
						{getErrorMessage(patchErr)}
					</Code>
				</Alert>}
				<div
					className={`${classes.formItem} ${classes.flex}`}>
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
	);
}
export default EditRefract;
