import React from "react";
import {Card, CardHeader, Divider, Grid} from "@mui/material";
import {useTheme} from "@mui/material/styles";

interface Props {
	title: string;
}

const Widget: React.FC<Props> = ({title, children}): JSX.Element => {
	// hooks
	const theme = useTheme();
	return <Grid
		sx={{overflowY: "auto", maxHeight: 500}}
		item
		xs={6}>
		<Card
			variant="outlined">
			<CardHeader
				sx={{backgroundColor: theme.palette.background.default}}
				title={title}
			/>
			<Divider/>
			{children}
		</Card>
	</Grid>
}
export default Widget;
