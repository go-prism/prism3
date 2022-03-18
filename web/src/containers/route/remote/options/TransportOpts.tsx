import {CircularProgress, List, ListItem, ListItemText, MenuItem, Select} from "@material-ui/core";
import React, {ChangeEvent} from "react";
import {Alert} from "@material-ui/lab";
import {useTheme} from "@material-ui/core/styles";
import useListTransports from "../../../../graph/actions/remote/useListTransports";
import {getGraphErrorMessage} from "../../../../selectors/getErrorMessage";
import {TransportSecurity} from "../../../../graph/types";

interface Props {
	selected: TransportSecurity | null;
	onSelect?: (val: TransportSecurity) => void;
}

const TransportOpts: React.FC<Props> = ({selected, onSelect}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {data, loading, error} = useListTransports();

	if (loading)
		return <CircularProgress/>;

	if (error != null)
		return <Alert
			severity="error">
			{getGraphErrorMessage(error)}
		</Alert>

	const handleChange = (e: ChangeEvent<{value: unknown}>): void => {
		if (onSelect == null || data?.listTransports == null)
			return;
		const id = e.target.value as string;
		for (let i = 0; i < data.listTransports.length; i++) {
			if (data.listTransports[i].id === id) {
				onSelect(data.listTransports[i]);
				return;
			}
		}
	}

	return <List>
		<ListItem
			style={{margin: theme.spacing(1)}}>
			<ListItemText
				primary="Transport profile"
				secondary="Settings used by Prism when establishing an HTTP(S) connection to the remote."
			/>
			<Select
				value={selected?.id}
				onChange={handleChange}
				variant="filled"
				style={{minWidth: 300}}>
				{data?.listTransports?.map(t => <MenuItem
					key={t.id}
					selected={selected?.id === t.id}
					value={t.id}>
					{t.name || "-"}
				</MenuItem>)}
			</Select>
		</ListItem>
	</List>
}
export default TransportOpts;
