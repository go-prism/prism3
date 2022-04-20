import React, {useContext, useState} from "react";
import {Alert, Card, Collapse, List, ListItem, ListItemText, ListSubheader, Switch} from "@mui/material";
import StandardLayout from "../../layout/StandardLayout";
import {AppContext} from "../../../../store/AppProvider";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {useSetPreferenceMutation} from "../../../generated/graphql";
import {PREF_DARK_THEME} from "../../../config/constants";

const UserPreferences: React.FC = (): JSX.Element => {
	// hooks
	const [showAll, setShowAll] = useState<boolean>(false);
	const {state: {user, userError}} = useContext(AppContext);
	const [setPreference, {loading, error}] = useSetPreferenceMutation();

	// helpers
	const darkTheme = user?.preferences[PREF_DARK_THEME] === "true";

	return <StandardLayout>
		{userError && <Alert
			sx={{textAlign: "center"}}
			severity="error">
			Something went wrong loading preferences.<br/>
			{getGraphErrorMessage(userError)}
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
					{Object.entries(user?.preferences || {}).map(([k, v]) => <ListItem
						key={k}>
						<ListItemText
							primary={k}
							secondary={v as string}
						/>
					</ListItem>)}
				</List>
			</Card>
		</Collapse>
	</StandardLayout>
}
export default UserPreferences;
