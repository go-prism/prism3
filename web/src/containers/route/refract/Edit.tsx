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
import {Alert, Button, FormGroup, FormLabel, List, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {useHistory} from "react-router-dom";
import {Code, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {useParams} from "react-router";
import {DataIsValid} from "../../../utils/data";
import getErrorMessage from "../../../selectors/getErrorMessage";
import ExpandableListItem from "../../list/ExpandableListItem";
import {IDParams} from "../settings";
import RefractHeader from "../../widgets/RefractHeader";
import {
	Archetype,
	Refraction,
	Remote,
	useGetRefractionLazyQuery,
	usePatchRefractMutation,
	Verb
} from "../../../generated/graphql";
import ResourceRoleViewer from "../acl/ResourceRoleViewer";
import useCanRBAC from "../../../hooks/useRBAC";
import {RESOURCE_REFRACT} from "../../../config/constants";
import Setup from "./options/Setup";
import RemoteSelect from "./RemoteSelect";

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

const EditRefract: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const history = useHistory();
	const {id} = useParams<IDParams>();

	// global state
	const canPatch = useCanRBAC({type: RESOURCE_REFRACT, id, verb: Verb.Update});
	const [patchRefraction, {error: patchErr}] = usePatchRefractMutation();
	const [getRefraction, {data, loading}] = useGetRefractionLazyQuery();


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
				disabled: data?.getRefraction == null || loading,
				hidden: false
			},
			{
				id: "rbac",
				primary: "Permissions",
				secondary: "",
				children: data?.getRefraction == null ? "" : <ResourceRoleViewer type={RESOURCE_REFRACT} id={data.getRefraction.name}/>,
				hidden: !canPatch
			}
		];
		return items.filter(d => !d.hidden).map(d => <ExpandableListItem
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
						InputProps: {className: classes.textField},
						InputLabelProps: {classes: {shrink: classes.textLabel}},
						required: true,
						label: "Name",
						variant: "outlined",
						id: "txt-name",
						size: "small",
						disabled: loading || readOnly || !canPatch
					}}
				/>
				{data?.getRefraction && <RemoteSelect
					arch={data.getRefraction.archetype}
					setRemotes={setRemotes}
					defaultRemotes={data.getRefraction.remotes as Remote[]}
					disabled={readOnly || !canPatch}
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
						disabled={!DataIsValid(name) || loading || readOnly || !canPatch}
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
