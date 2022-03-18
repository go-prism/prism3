import React, {ReactNode} from "react";
import {makeStyles, Theme, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		display: "flex",
		alignItems: "center"
	},
	grow: {
		flexGrow: 1
	},
	text: {
		fontFamily: "Manrope",
		fontWeight: 500,
		marginLeft: theme.spacing(2)
	},
	subtext: {
		color: theme.palette.text.secondary
	}
}))

interface HeaderProps {
	title: string;
	counter?: number;
	actions: ReactNode;
}

const Header: React.FC<HeaderProps> = ({title, counter, actions}): JSX.Element => {
	const classes = useStyles();
	return <div className={classes.root}>
		<Typography
			className={classes.text}
			color="textPrimary"
			variant="h5">
			{title}
			{counter != null && <span className={classes.subtext}>
				&nbsp;({counter})
			</span>}
		</Typography>
		<div className={classes.grow}/>
		{actions}
	</div>
}
export default Header;
