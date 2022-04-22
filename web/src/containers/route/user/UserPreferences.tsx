import React, {useMemo, useState} from "react";
import {Alert, Card, Collapse, List, ListItem, ListItemText, ListSubheader, Switch} from "@mui/material";
import StandardLayout from "../../layout/StandardLayout";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {useSetPreferenceMutation, useWatchCurrentUserSubscription} from "../../../generated/graphql";
import {PREF_DARK_THEME, PREF_FMT_DATE_ABS} from "../../../config/constants";

const UserPreferences: React.FC = (): JSX.Element => {
	// hooks
	const [showAll, setShowAll] = useState<boolean>(false);
	const [setPreference, {loading, error}] = useSetPreferenceMutation();
	const getCurrentUser = useWatchCurrentUserSubscription();

	// helpers
	const darkTheme = getCurrentUser.data?.getCurrentUser.preferences[PREF_DARK_THEME] === "true";
	const formatDateAbs = getCurrentUser.data?.getCurrentUser.preferences[PREF_FMT_DATE_ABS] === "true";

	const preferences = useMemo(() => {
		return Object.entries(getCurrentUser.data?.getCurrentUser.preferences || {}).map(([k, v]) => <ListItem
			key={k}>
			<ListItemText
				primary={k}
				secondary={v as string}
			/>
		</ListItem>);
	}, [getCurrentUser.data?.getCurrentUser]);

	return <StandardLayout>
		{getCurrentUser.error && <Alert
			sx={{textAlign: "center"}}
			severity="error">
			Something went wrong loading preferences.<br/>
			{getGraphErrorMessage(getCurrentUser.error)}
		</Alert>}
		{error && <Alert
			sx={{textAlign: "center"}}
			severity="error">
			Failed to update preference<br/>
			{getGraphErrorMessage(error)}
		</Alert>}
		<ListSubheader>
			General
		</ListSubheader>
		<Card
			sx={{mt: 2}}
			variant="outlined">
			<List
				sx={{maxHeight: 400, overflowY: "auto"}}>
				<ListItem>
					<ListItemText
						primary="Theme"
						secondary={darkTheme ? "Dark theme" : "Light theme"}
					/>
					<Switch
						checked={darkTheme}
						disabled={loading}
						onChange={(_, checked) => void setPreference({variables: {key: PREF_DARK_THEME, value: checked.toString()}})}
					/>
				</ListItem>
				<ListItem>
					<ListItemText
						primary="Date format"
						secondary={formatDateAbs ? "Absolute" : "Relative (e.g. 30 minutes ago)"}
					/>
					<Switch
						checked={formatDateAbs}
						disabled
						onChange={(_, checked) => void setPreference({variables: {key: PREF_FMT_DATE_ABS, value: checked.toString()}})}
					/>
				</ListItem>
			</List>
		</Card>
		<ListSubheader>
			Raw preferences
			<Switch
				checked={showAll}
				onChange={(_, checked) => setShowAll(checked)}
			/>
		</ListSubheader>
		<Collapse
			in={showAll}
			mountOnEnter>
			<Card
				sx={{mt: 2}}
				variant="outlined">
				<List
					sx={{maxHeight: 400, overflowY: "auto"}}>
					{preferences}
				</List>
			</Card>
		</Collapse>
	</StandardLayout>
}
export default UserPreferences;
