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
import {ApolloError} from "@apollo/client";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {REMOTE_ARCHETYPES} from "../../../config/constants";
import {Archetype, Remote} from "../../../graph/types";
import useCreateRefract from "../../../graph/actions/remote/useCreateRefract";
import RemoteSelect from "./RemoteSelect";

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

const initialName: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
}

const CreateRefract: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const history = useHistory();

	const [createRefract, {loading, error}] = useCreateRefract();

	// local state
	const [arch, setArch] = useState<Archetype>(Archetype.GENERIC);
	const [name, setName] = useState<ValidatedData>(initialName);
	const [remotes, setRemotes] = useState<Remote[]>([]);

	const handleArchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setArch((event.target as HTMLInputElement).value as Archetype);
	};

	const handleCreate = (): void => {
		createRefract({variables: {
			name: name.value,
			archetype: arch,
			remotes: remotes.map(r => r.id)
		}}).then(r => {
			if (!r.errors) {
				history.push(`/refract/${r.data?.createRefraction.id}/-/edit`);
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
					Create refraction
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
							label: "Refraction name",
							variant: "outlined",
							id: "txt-name"
						}}
					/>
					<FormLabel
						className={classes.formItem}
						component="legend">
						Archetype
						<Tooltip title="The Archetype describes any special handling that this refraction may require. E.g. not caching maven-metadata.xml">
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
							key={a.value}
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
					<RemoteSelect
						arch={arch}
						setRemotes={setRemotes}
					/>
					{error != null && <Alert
						severity="error">
						Something went wrong.
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
							to="/refract"
							variant="outlined">
							Cancel
						</Button>
						<div className={classes.grow}/>
						<Button
							className={classes.button}
							style={{color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main}}
							disabled={!DataIsValid(name) || loading}
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
export default CreateRefract;
