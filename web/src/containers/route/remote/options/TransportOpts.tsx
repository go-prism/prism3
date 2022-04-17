import {Alert, CircularProgress, List, ListItem, ListItemText, MenuItem, Select} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {getGraphErrorMessage} from "../../../../selectors/getErrorMessage";
import {TransportSecurity, useListTransportsQuery} from "../../../../generated/graphql";

interface Props {
	onSelect: (val: TransportSecurity) => void;
	disabled?: boolean;
}

const TransportOpts: React.FC<Props> = ({onSelect, disabled}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {data, loading, error} = useListTransportsQuery();
	const [selected, setSelected] = useState<TransportSecurity | null>(null);

	useEffect(() => {
		if (data?.listTransports == null)
			return;
		if (data.listTransports.length === 0)
			return;
		setSelected(() => data.listTransports[0] as TransportSecurity);
		onSelect(data.listTransports[0] as TransportSecurity);
	}, [data?.listTransports]);

	if (loading)
		return <CircularProgress/>;

	if (error != null) {
		return <Alert
			severity="error">
			{getGraphErrorMessage(error)}
		</Alert>;
	}

	return <List>
		<ListItem
			style={{margin: theme.spacing(1)}}>
			<ListItemText
				primary="Transport profile"
				secondary="Settings used by Prism when establishing an HTTP(S) connection to the remote."
			/>
			{data?.listTransports != null && data.listTransports.length > 0 && <Select
				disabled={disabled}
				value={selected?.id || data.listTransports[0].id}
				variant="filled"
				style={{minWidth: 300}}>
				{data.listTransports.map(t => <MenuItem
					key={t.id}
					disabled={disabled}
					selected={selected?.id === t.id}
					onClick={() => {
						setSelected(() => t as TransportSecurity);
						onSelect(t as TransportSecurity);
					}}
					value={t.id}>
					{t.name || "-"}
				</MenuItem>)}
			</Select>}
		</ListItem>
	</List>
}
export default TransportOpts;
