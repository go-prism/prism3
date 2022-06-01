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
	FormControlLabel,
	FormGroup,
	FormLabel,
	Radio,
	RadioGroup,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {Link, useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {REMOTE_ARCHETYPES} from "../../../config/constants";
import {Archetype, Remote, useCreateRefractMutation} from "../../../generated/graphql";
import Flexbox from "../../widgets/Flexbox";
import InlineBadge from "../../../components/feedback/InlineBadge";
import RemoteSelect from "./RemoteSelect";

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
	},
	textField: {
		borderRadius: theme.spacing(1)
	},
	textLabel: {
		color: theme.palette.text.primary,
		fontWeight: 500
	}
}));

const initialName: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
}

const CreateRefract: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();

	const [createRefract, {loading, error}] = useCreateRefractMutation();

	// local state
	const [arch, setArch] = useState<Archetype>(Archetype.Generic);
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
		<StandardLayout
			size="small">
			<Box
				sx={{mt: 2}}>
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
							InputProps: {className: classes.textField},
							InputLabelProps: {classes: {shrink: classes.textLabel}},
							required: true,
							label: "Name",
							variant: "outlined",
							id: "txt-name",
							size: "small"
						}}
					/>
					<FormLabel
						className={classes.formItem}
						component="legend">
						Archetype
					</FormLabel>
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
							label={<Flexbox inline>
								{a.name}
								{!a.stable && <InlineBadge
									colour={theme.palette.info.main}>
									Preview
								</InlineBadge>}
							</Flexbox>}
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
			</Box>
		</StandardLayout>
	);
}
export default CreateRefract;
