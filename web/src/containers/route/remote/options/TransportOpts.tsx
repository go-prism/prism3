import {Alert, CircularProgress, List, ListItem, ListItemText, MenuItem, Select} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import useListTransports from "../../../../graph/actions/remote/useListTransports";
import {getGraphErrorMessage} from "../../../../selectors/getErrorMessage";
import {TransportSecurity} from "../../../../graph/types";

interface Props {
	onSelect: (val: TransportSecurity) => void;
}

const TransportOpts: React.FC<Props> = ({onSelect}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {data, loading, error} = useListTransports();
	const [selected, setSelected] = useState<TransportSecurity | null>(null);

	useEffect(() => {
		if (data?.listTransports == null)
			return;
		if (data.listTransports.length === 0)
			return;
		setSelected(data.listTransports[0]);
		onSelect(data.listTransports[0]);
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
				value={selected?.id || data.listTransports[0].id}
				variant="filled"
				style={{minWidth: 300}}>
				{data.listTransports.map(t => <MenuItem
					key={t.id}
					selected={selected?.id === t.id}
					onClick={() => {
						console.log(t.id);
						setSelected(t);
						onSelect(t);
					}}
					value={t.id}>
					{t.name || "-"}
				</MenuItem>)}
			</Select>}
		</ListItem>
	</List>
}
export default TransportOpts;
