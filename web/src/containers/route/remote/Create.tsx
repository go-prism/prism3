import React, {useState} from "react";
import {
	Badge,
	Button,
	FormControlLabel,
	FormGroup,
	FormLabel,
	makeStyles,
	Radio,
	RadioGroup,
	Theme,
	Tooltip,
	Typography
} from "@material-ui/core";
import Icon from "@mdi/react";
import {mdiInformationOutline} from "@mdi/js";
import {useTheme} from "@material-ui/core/styles";
import {Link, useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {Alert} from "@material-ui/lab";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import getErrorMessage, {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {REMOTE_ARCHETYPES} from "../../../config/constants";
import useCreateRemote from "../../../graph/actions/remote/useCreateRemote";
import {Archetype, TransportSecurity} from "../../../graph/types";
import TransportOpts from "./options/TransportOpts";

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
	const classes = useStyles();
	const theme = useTheme();
	const history = useHistory();

	// global state
	const [createRemote, {loading, error}] = useCreateRemote();


	// local state
	const [arch, setArch] = useState<Archetype>(Archetype.GENERIC);
	const [url, setURL] = useState<ValidatedData>(initialURL);
	const [name, setName] = useState<ValidatedData>(initialName);
	const [transport, setTransport] = useState<TransportSecurity | null>(null);

	const handleArchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setArch((e.target as HTMLInputElement).value as Archetype);
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
		<StandardLayout>
			<div>
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
							label: "Remote name",
							variant: "filled",
							id: "txt-name"
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
							id: "txt-url"
						}}
					/>
					<TransportOpts
						selected={transport}
						onSelect={setTransport}
					/>
					<FormLabel
						className={classes.formItem}
						component="legend">
						Archetype
						<Tooltip title="The Archetype describes any special handling that this remote may require. E.g. not caching maven-metadata.xml">
							<Icon
								className={classes.formIcon}
								path={mdiInformationOutline}
								color={theme.palette.secondary.main}
								size={1}
							/>
						</Tooltip>
					</FormLabel>
					<Alert
						severity="info">
						Some archetypes are available for Early Access, however they are not production ready.
						They are indicated by the&emsp;<Badge badgeContent="EA" color="primary"/>.
					</Alert>
					<RadioGroup
						className={classes.formItem}
						aria-label="archetype"
						name="archetype"
						value={arch}
						onChange={handleArchChange}>
						{REMOTE_ARCHETYPES.map(a => <FormControlLabel
							key={a.name}
							control={<Radio
								color="primary"
							/>}
							label={a.stable ? <>
								{a.name}
							</> : <Badge
								badgeContent="EA"
								color="primary">
								{a.name}
							</Badge>}
							value={a.value}
						/>)}
					</RadioGroup>
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
			</div>
		</StandardLayout>
	);
}
export default CreateRemote;
