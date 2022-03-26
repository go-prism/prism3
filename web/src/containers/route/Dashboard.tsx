import React, {ReactNode, useEffect} from "react";
import {
	Avatar,
	Box,
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
import {ArrowsRight, ArrowsSplit, CloudDownload, CloudUpload, InfoCircle, ListDetails} from "tabler-icons-react";
import {useTheme} from "@material-ui/core/styles";
import {formatDistanceStrict} from "date-fns";
import {Alert} from "@material-ui/lab";
import {ThemedTooltip} from "jmp-coreui";
import useGetOverview from "../../graph/actions/useGetOverview";
import {formatBytes} from "../../utils/format";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";
import {getRemoteIcon} from "../../utils/remote";
import {Archetype} from "../../graph/types";
import Flexbox from "../widgets/Flexbox";

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

	const item = (title: string, icon: ReactNode, children: ReactNode, info?: string): ReactNode => {
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
						}}>
						<Flexbox>
							{title}
							{info != null && <ThemedTooltip
								interactive
								title={info}
								placement="right">
								<Box
									style={{display: "flex", alignItems: "center"}}>
									<InfoCircle
										style={{marginLeft: theme.spacing(1)}}
										color={theme.palette.text.disabled}
										size={16}
									/>
								</Box>
							</ThemedTooltip>}
						</Flexbox>
					</ListItemText>
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
		{error && <Alert>
			Something went wrong loading the dashboard.<br/>
			{getGraphErrorMessage(error)}
		</Alert>}
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
			{item("NPM Indices", getRemoteIcon(theme, Archetype.NPM), data?.getOverview.packages_npm.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
			{item("PyPi Indices", getRemoteIcon(theme, Archetype.PIP), data?.getOverview.packages_pypi.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
			{item("Storage", <CloudUpload color={theme.palette.primary.main}/>, formatBytes(data?.getOverview.storage || 0, false, 0))}
		</Grid>
	</div>
}
export default Dashboard;
