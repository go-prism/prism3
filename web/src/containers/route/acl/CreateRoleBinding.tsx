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

import React, {useEffect, useState} from "react";
import {
	Alert,
	Autocomplete,
	Box,
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
	TextField,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Link, useHistory} from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import getErrorMessage from "../../../selectors/getErrorMessage";
import {toTitleCase} from "../../../utils/format";
import Flexbox from "../../widgets/Flexbox";
import {getResourceIcon} from "../../../utils/remote";
import {Role, StoredUser, useCreateRoleBindingMutation, useListUsersQuery, Verb} from "../../../generated/graphql";
import {getClaimValue, parseUsername} from "../../../utils/parse";
import {RESOURCE_REFRACT, RESOURCE_REMOTE, RESOURCE_TRANSPORT} from "../../../config/constants";

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

const initialID: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
};

const ROLE_GLOBAL = "Global";
const ROLE_SCOPED = "Scoped";

const RESOURCES = [RESOURCE_REFRACT, RESOURCE_REMOTE, RESOURCE_TRANSPORT];
const ROLES = [ROLE_GLOBAL, ROLE_SCOPED];

const CreateRoleBinding: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();

	// global state
	const [createRoleBinding, {loading, error}] = useCreateRoleBindingMutation();
	const listUsers = useListUsersQuery();

	// local state
	const [user, setUser] = useState<string>("");
	const [id, setID] = useState<ValidatedData>(initialID);
	const [role, setRole] = useState<string>(ROLE_SCOPED);
	const [resource, setResource] = useState<string>("");

	const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setRole((e.target as HTMLInputElement).value);
	}

	useEffect(() => {
		if (role !== ROLE_GLOBAL)
			return;
		setResource(() => "");
		setID(i => ({...i, value: ""}));
	}, [role]);

	const handleCreate = (): void => {
		createRoleBinding({variables: {
			subject: user,
			resource: role === ROLE_SCOPED ? `${resource}::${id.value}` : resource,
			verb: Verb.Sudo
		}}).then(r => {
			if (!r.errors) {
				history.push("/settings/sys/acl");
			}
		});
	}

	return (
		<StandardLayout>
			<Box sx={{mt: 2}}>
				<Typography
					className={classes.title}
					color="textPrimary"
					variant="h4">
					Create RoleBinding
				</Typography>
				<FormGroup
					className={classes.form}>
					<FormLabel
						className={classes.formItem}
						component="legend">
						Role type
					</FormLabel>
					<RadioGroup
						className={classes.formItem}
						aria-label="role"
						name="role"
						value={role}
						onChange={handleRoleChange}>
						{Object.values(ROLES).map(r => <FormControlLabel
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
									{r === ROLE_GLOBAL ? "Applies to all resources." : "Applyies to a specific resource."}
								</Typography>
							</div>}
							value={r}
						/>)}
					</RadioGroup>
					<Autocomplete
						className={classes.formItem}
						disablePortal
						options={listUsers.data?.listUsers || []}
						renderInput={params => <TextField {...params} label="User"/>}
						getOptionLabel={option => getClaimValue(option as StoredUser, "name") || getClaimValue(option as StoredUser, "nickname") || parseUsername(option.sub)}
						onChange={(e, value) => setUser(() => value?.id || "")}
					/>
					{role === ROLE_GLOBAL && <FormControl
						sx={{m: 1, pr: 1}}
						fullWidth>
						<InputLabel>Role</InputLabel>
						<Select
							sx={{minWidth: 200}}
							variant="outlined"
							value={resource}
							label="Role"
							required>
							{Object.values(Role).map(r => <MenuItem
								key={r}
								value={r}
								onClick={() => setResource(() => r)}>
								{toTitleCase(r)}
							</MenuItem>)}
						</Select>
					</FormControl>}
					{role === ROLE_SCOPED && <Grid container>
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
									required>
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
									required: true,
									label: `${toTitleCase(resource || "Resource")} name`,
									placeholder: "maven-central",
									variant: "filled",
									id: "txt-resource",
									fullWidth: true
								}}
							/>
						</Grid>
					</Grid>}
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
							disabled={user === "" || loading || role == null}
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
export default CreateRoleBinding;
