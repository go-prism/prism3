import {Card, CardContent, Theme, Typography} from "@mui/material";
import React from "react";
import {Icon} from "tabler-icons-react";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
	card: {
		margin: theme.spacing(2),
		marginRight: 0
	},
	title: {
		marginLeft: theme.spacing(1),
		fontFamily: "Manrope",
		fontWeight: 500
	},
	header: {
		display: "flex",
		alignItems: "center",
		marginBottom: theme.spacing(1)
	}
}));

interface Props {
	title: string;
	icon: Icon
}

const InfoCard: React.FC<Props> = ({title, children, ...props}): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	return <Card
		className={classes.card}
		variant="outlined">
		<CardContent>
			<div className={classes.header}>
				<props.icon
					color={theme.palette.info.main}
				/>
				<Typography
					className={classes.title}
					variant="h5">
					{title}
				</Typography>
			</div>
			{children}
		</CardContent>
	</Card>
}
export default InfoCard;
