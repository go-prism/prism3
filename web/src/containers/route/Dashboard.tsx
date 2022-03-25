import React, {ReactNode, useEffect} from "react";
import {
	Avatar,
	Card,
	CircularProgress,
	Grid,
	ListItem,
	ListItemIcon,
	ListItemText,
	makeStyles,
	Theme,
	Typography
} from "@material-ui/core";
import {ArrowsRight, ArrowsSplit, CloudDownload, CloudUpload, ListDetails} from "tabler-icons-react";
import {useTheme} from "@material-ui/core/styles";
import {formatDistanceStrict} from "date-fns";
import useGetOverview from "../../graph/actions/useGetOverview";
import {formatBytes} from "../../utils/format";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		flexGrow: 1
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: "center",
		color: theme.palette.text.secondary,
		margin: theme.spacing(2)
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 100,
		margin: 12,
		padding: 6,
		backgroundColor: theme.palette.background.default
	},
	brand: {
		paddingRight: 8,
		[theme.breakpoints.up("sm")]: {
			paddingRight: 0
		},
		fontFamily: "Manrope",
		fontWeight: 500,
		pointerEvents: "none"
	},
	subtitle: {
		marginLeft: theme.spacing(3)
	}
}));

const Dashboard: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const {data, loading, error} = useGetOverview();

	useEffect(() => {
		window.document.title = "Prism";
	}, []);

	const item = (title: string, icon: ReactNode, children: ReactNode): ReactNode => {
		return <Grid
			item
			xs>
			<Card
				className={classes.paper}
				variant="outlined">
				<ListItem>
					<ListItemIcon>
						{icon}
					</ListItemIcon>
					<ListItemText
						primaryTypographyProps={{
							variant: "body2",
							color: "textSecondary"
						}}
						primary={title}
					/>
					<Typography
						variant="h5"
						component="h2"
						color="textPrimary">
						{!loading ? children : <CircularProgress
							size={16}
							thickness={8}
						/>}
					</Typography>
				</ListItem>
			</Card>
		</Grid>
	}

	return <div className={classes.root}>
		<div
			style={{display: "flex", alignItems: "center"}}>
			<Avatar
				className={classes.avatar}
				src="/favicon.png"
				alt="Prism logo"
			/>
			<Typography
				className={classes.brand}
				variant="h2"
				color="textPrimary">
				Prism
			</Typography>
		</div>
		<Typography
			className={classes.subtitle}
			color="textSecondary">
			{data?.getOverview.version}<br/>
			This instance has been running for {formatDistanceStrict(Date.now(), data?.getOverview.uptime || 0)}
		</Typography>
		<Grid
			container
			spacing={0}>
			{item("Artifacts", <ListDetails color={theme.palette.primary.main}/>, data?.getOverview.artifacts.toLocaleString() || 0)}
			{item("Downloads", <CloudDownload color={theme.palette.success.main}/>, data?.getOverview.downloads.toLocaleString() || 0)}
			{item("Remotes", <ArrowsRight color={theme.palette.secondary.main}/>, data?.getOverview.remotes.toLocaleString() || 0)}
			{item("Refractions", <ArrowsSplit color={theme.palette.info.main}/>, data?.getOverview.refractions.toLocaleString() || 0)}
		</Grid>
		<Grid
			container
			spacing={0}>
			{item("Storage", <CloudUpload color={theme.palette.primary.main}/>, formatBytes(data?.getOverview.storage || 0, false, 0))}
		</Grid>
	</div>
}
export default Dashboard;
