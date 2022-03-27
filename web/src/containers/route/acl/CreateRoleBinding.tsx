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

import React, {useState} from "react";
import {
	Alert,
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
import {Link, useHistory} from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import useLoading from "../../../hooks/useLoading";
import useErrors from "../../../hooks/useErrors";
import {DataIsValid} from "../../../utils/data";
import getErrorMessage from "../../../selectors/getErrorMessage";

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

const initialSub: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^.{3,}$/)
};

const ROLE_POWER = "power_user";
const ROLE_SUPER = "super_user";

const ROLES = [ROLE_SUPER, ROLE_POWER];

const CreateRoleBinding: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();

	// global state
	const loading = useLoading([]);
	const error = useErrors([]);

	// local state
	const [user, setUser] = useState<ValidatedData>(initialUser);
	const [sub, setSub] = useState<ValidatedData>(initialSub);
	const [role, setRole] = useState<string>("");

	const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setRole((e.target as HTMLInputElement).value);
	}

	const handleCreate = (): void => {
		// dispatch(createRole(role, sub.value, user.value)).then((action) => {
		// 	// only change the url if there was a success
		// 	if (action.error !== true)
		// 		history.push("/settings/acl");
		// });
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
							variant: "outlined",
							id: "txt-user"
						}}
					/>
					<ValidatedTextField
						data={sub}
						setData={setSub}
						invalidLabel="Must be at least 3 characters."
						fieldProps={{
							className: classes.formItem,
							required: role === ROLE_POWER,
							label: "Subject",
							variant: "outlined",
							id: "txt-subject",
							disabled: role !== ROLE_POWER
						}}
					/>
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
						{ROLES.map(r => <FormControlLabel
							key={r}
							control={<Radio color="primary"/>}
							label={r}
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
							to="/settings/acl"
							variant="outlined">
							Cancel
						</Button>
						<div className={classes.grow}/>
						<Button
							className={classes.button}
							style={{color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main}}
							disabled={!DataIsValid(user) || loading || role === ""}
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
