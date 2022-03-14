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

import React, {useMemo, useState} from "react";
import {
	Button,
	Card,
	Collapse,
	List,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	ListSubheader,
	makeStyles,
	Switch,
	Theme,
	Typography
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {GenericIconButton, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {mdiDeleteOutline} from "@mdi/js";
import {useTheme} from "@material-ui/core/styles";
import {DEFAULT_RESTRICTED_HEADERS} from "../../../../config/constants";
import {DataIsValid} from "../../../../utils/data";

const useStyles = makeStyles((theme: Theme) => ({
	button: {
		textTransform: "none",
		fontFamily: "Manrope",
		fontWeight: 600,
		marginTop: theme.spacing(1)
	},
	text: {
		margin: theme.spacing(1)
	}
}));

interface RestrictedHeadersProps {
	stripRestricted: boolean;
	setStripRestricted: (v: boolean) => void;
	restrictedHeaders: string[];
	setRestrictedHeaders: (v: string[]) => void;
	loading?: boolean;
	disabled?: boolean;
}

interface Header {
	key: string;
	readonly: boolean;
}

const initialHeader: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/^([-!#-'*+.0-9A-Z^-z|~]+)/)
}

const RestrictedHeaders: React.FC<RestrictedHeadersProps> = ({
	stripRestricted,
	setStripRestricted,
	restrictedHeaders,
	setRestrictedHeaders,
	loading,
	disabled = false
}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const classes = useStyles();

	// local state
	const [header, setHeader] = useState<ValidatedData>(initialHeader);
	const headers = useMemo(() => {
		const headerObj: Header[] = DEFAULT_RESTRICTED_HEADERS.map(h => ({key: h, readonly: true})).concat(restrictedHeaders.map(h => ({key: h, readonly: false})));
		return headerObj.map(h => <ListItem
			dense
			key={h.key}>
			<ListItemText
				primaryTypographyProps={{color: h.readonly ? "textSecondary" : "textPrimary"}}>
				{h.key}
			</ListItemText>
			{!h.readonly && <ListItemSecondaryAction>
				<GenericIconButton
					title="Delete"
					icon={mdiDeleteOutline}
					colour={theme.palette.error.main}
					onClick={() => setRestrictedHeaders(restrictedHeaders.filter(k => k !== h.key))}
					disabled={loading || disabled}
				/>
			</ListItemSecondaryAction>}
		</ListItem>)
	}, [restrictedHeaders, loading, disabled]);

	const onCreateHeader = (): void => {
		setRestrictedHeaders([...restrictedHeaders, header.value]);
	}

	return (
		<div>
			<Typography
				className={classes.text}
				color="textSecondary"
				variant="body2">
				Restricted headers are combined and hashed to create a "unique" cache partition for individual requests.
				Optionally, these headers can be removed entirely. This is useful when creating remotes that target public sources (e.g. Maven Central).
			</Typography>
			<Collapse
				in={stripRestricted}>
				<Alert
					severity="warning">
					Stripping restricted headers will cause authentication to fail.
					Only anonymous objects will be retrievable from this remote.
				</Alert>
			</Collapse>
			<ListItem>
				<ListItemIcon>
					<Switch
						color="primary"
						checked={stripRestricted}
						onChange={(_, checked) => setStripRestricted(checked)}
						disabled={loading || disabled}
					/>
				</ListItemIcon>
				<ListItemText
					primary="Strip restricted headers"
					secondary="Prism will remove restricted headers when contacting this remote."
				/>
			</ListItem>
			<Card
				style={{padding: theme.spacing(2)}}
				variant="outlined">
				<ValidatedTextField
					data={header}
					setData={setHeader}
					invalidLabel="Must be a valid HTTP header"
					fieldProps={{
						required: true,
						label: "Header",
						variant: "outlined",
						id: "txt-header",
						fullWidth: true,
						disabled: loading || disabled
					}}
				/>
				<Button
					className={classes.button}
					variant="contained"
					color="primary"
					onClick={onCreateHeader}
					disabled={!DataIsValid(header) || loading || restrictedHeaders.includes(header.value) || DEFAULT_RESTRICTED_HEADERS.includes(header.value) || disabled}>
					Create
				</Button>
			</Card>
			<ListSubheader>Restricted headers ({headers.length})</ListSubheader>
			<List>
				{headers}
			</List>
		</div>
	);
}
export default RestrictedHeaders;
