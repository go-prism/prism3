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
	Button,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	Grid,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Link, useHistory} from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import {DataIsValid} from "../../../utils/data";
import getErrorMessage from "../../../selectors/getErrorMessage";
import {toTitleCase} from "../../../utils/format";
import Flexbox from "../../widgets/Flexbox";
import {getResourceIcon} from "../../../utils/remote";
import {Role, useCreateRoleBindingMutation} from "../../../generated/graphql";

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

const initialUser: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
};

const initialID: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
};

const RESOURCE_REFRACT = "refraction";

const RESOURCES = [RESOURCE_REFRACT];

const CreateRoleBinding: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();

	// global state
	const [createRoleBinding, {loading, error}] = useCreateRoleBindingMutation();

	// local state
	const [user, setUser] = useState<ValidatedData>(initialUser);
	const [id, setID] = useState<ValidatedData>(initialID);
	const [role, setRole] = useState<Role>(Role.Power);
	const [resource, setResource] = useState<string>("");

	const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setRole((e.target as HTMLInputElement).value as Role);
	}

	useEffect(() => {
		if (role !== Role.Super)
			return;
		setResource(() => "");
		setID(i => ({...i, value: ""}));
	}, [role]);

	const handleCreate = (): void => {
		createRoleBinding({variables: {
			role: role!,
			resource: `${resource}::${id.value}`,
			subject: user.value
		}}).then(r => {
			if (!r.errors) {
				history.push("/settings/sys/acl");
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
					Create RoleBinding
				</Typography>
				<FormGroup
					className={classes.form}>
					<ValidatedTextField
						data={user}
						setData={setUser}
						invalidLabel="Must be at least 3 characters."
						fieldProps={{
							className: classes.formItem,
							required: true,
							label: "Username",
							variant: "filled",
							id: "txt-user"
						}}
					/>
					<Grid container>
						<Grid item xs={6}>
							<FormControl
								sx={{m: 1, pr: 1}}
								fullWidth>
								<InputLabel>Resource</InputLabel>
								<Select
									sx={{minWidth: 200}}
									variant="outlined"
									value={resource}
									label="Resource"
									required={role === Role.Power}
									disabled={role !== Role.Power}>
									{RESOURCES.map(r => <MenuItem
										key={r}
										value={r}
										onClick={() => setResource(() => r)}>
										<Flexbox>
											{getResourceIcon(theme, r)}
											{toTitleCase(r)}
										</Flexbox>
									</MenuItem>)}
								</Select>
							</FormControl>
						</Grid>
						<Grid
							item
							xs={6}
							sx={{pr: 2, pl: 1}}>
							<ValidatedTextField
								data={id}
								setData={setID}
								invalidLabel="Must be at least 3 characters."
								fieldProps={{
									className: classes.formItem,
									required: role === Role.Power,
									label: `${toTitleCase(resource || "Resource")} name`,
									placeholder: "maven-central",
									variant: "filled",
									id: "txt-resource",
									disabled: role !== Role.Power,
									fullWidth: true
								}}
							/>
						</Grid>
					</Grid>
					<FormLabel
						className={classes.formItem}
						component="legend">
						Role
					</FormLabel>
					<RadioGroup
						className={classes.formItem}
						aria-label="role"
						name="role"
						value={role}
						onChange={handleRoleChange}>
						{Object.keys(Role).map(r => <FormControlLabel
							key={r}
							control={<Radio color="primary"/>}
							label={<div>
								<Typography
									sx={{fontSize: 14}}>
									{toTitleCase(r)}
								</Typography>
								<Typography
									sx={{fontSize: 14}}
									color="text.secondary">
									{r === Role.Super ? "Grant full permissions to all resources." : "Grant full permissions to a specific resource."}
								</Typography>
							</div>}
							value={r}
						/>)}
					</RadioGroup>
					{error != null && <Alert
						severity="error">
						Failed to create RoleBinding.
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
							disabled={!DataIsValid(user) || loading || role == null}
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
export default CreateRoleBinding;
