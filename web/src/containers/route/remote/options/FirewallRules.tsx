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
	Alert,
	Button,
	Card,
	List,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	ListSubheader,
	Switch,
	Theme,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useTheme} from "@mui/material/styles";
import {GenericIconButton, ValidatedData, ValidatedTextField} from "jmp-coreui";
import {mdiDeleteOutline} from "@mdi/js";
import {DataIsValid} from "../../../../utils/data";

const useStyles = makeStyles()((theme: Theme) => ({
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

interface FirewallRulesProps {
	allowRules: string[];
	blockRules: string[];
	setAllowRules: (r: string[]) => void;
	setBlockRules: (r: string[]) => void;
	loading?: boolean;
	disabled?: boolean;
}

const initialRule: ValidatedData = {
	value: "",
	error: "",
	regex: new RegExp(/.*/)
}

const FirewallRules: React.FC<FirewallRulesProps> = ({
	allowRules,
	blockRules,
	setAllowRules,
	setBlockRules,
	loading,
	disabled = false
}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {classes} = useStyles();

	// local state
	const [rule, setRule] = useState<ValidatedData>(initialRule);
	const [block, setBlock] = useState<boolean>(true);

	const onCreateRule = (): void => {
		if (block) {
			setBlockRules([...blockRules, rule.value]);
			return;
		}
		setAllowRules([...allowRules, rule.value]);
	}

	const renderRules = (rules: string[], onDelete: (v: string) => void): JSX.Element[] => {
		return rules.map(r => <ListItem
			key={r}
			dense>
			<ListItemText>
				{r}
			</ListItemText>
			<ListItemSecondaryAction>
				<GenericIconButton
					title="Delete"
					icon={mdiDeleteOutline}
					colour={theme.palette.error.main}
					disabled={loading || disabled}
					onClick={() => onDelete(r)}
				/>
			</ListItemSecondaryAction>
		</ListItem>);
	}

	const allowItems = useMemo(() => {
		return renderRules(allowRules, v => setAllowRules(allowRules.filter(r => r !== v)));
	}, [allowRules]);

	const blockItems = useMemo(() => {
		return renderRules(blockRules, v => setBlockRules(blockRules.filter(r => r !== v)));
	}, [blockRules]);

	return (
		<div>
			<Card
				style={{padding: theme.spacing(2)}}
				variant="outlined">
				<ListItem>
					<ListItemIcon>
						<Switch
							color="primary"
							checked={block}
							disabled={loading || disabled}
							onChange={(_, checked) => setBlock(checked)}
						/>
					</ListItemIcon>
					<ListItemText
						primary="Blocking"
						secondary={block ? "Requests to this remote will be blocked when this regex matches." : "Requests to this remote will only be allowed when this regex matches."}
					/>
				</ListItem>
				<ValidatedTextField
					data={rule}
					setData={setRule}
					invalidLabel="Must be set"
					fieldProps={{
						required: true,
						label: "Regex rule",
						variant: "outlined",
						id: "txt-rule",
						fullWidth: true,
						disabled: loading || disabled
					}}
				/>
				<Button
					className={classes.button}
					variant="contained"
					color="primary"
					onClick={onCreateRule}
					disabled={!DataIsValid(rule) || loading || (!block && allowRules.includes(rule.value)) || (block && blockRules.includes(rule.value)) || disabled}>
					Create
				</Button>
			</Card>
			<ListSubheader>Allow rules ({allowRules.length})</ListSubheader>
			{allowRules.length === 0 && <Alert
				severity="info">
				No allow rules found.
			</Alert>}
			<List>
				{allowItems}
			</List>
			<ListSubheader>Block rules ({blockRules.length})</ListSubheader>
			{blockRules.length === 0 && <Alert
				severity="info">
				No block rules found.
			</Alert>}
			<List>
				{blockItems}
			</List>
		</div>
	);
}
export default FirewallRules;
