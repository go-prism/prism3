import React, {ReactNode, useEffect} from "react";
import {
	Alert,
	Avatar,
	Box,
	Card,
	CardHeader,
	CircularProgress,
	Divider,
	Grid,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Theme,
	Typography,
} from "@mui/material";
import {
	ArrowsRight,
	ArrowsSplit,
	Book,
	CloudDownload,
	CloudUpload,
	Compass,
	InfoCircle,
	ListDetails
} from "tabler-icons-react";
import {useTheme} from "@mui/material/styles";
import {formatDistanceStrict} from "date-fns";
import {ThemedTooltip} from "jmp-coreui";
import {makeStyles} from "tss-react/mui";
import {Link} from "react-router-dom";
import {formatBytes} from "../../utils/format";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";
import {getRemoteIcon} from "../../utils/remote";
import Flexbox from "../widgets/Flexbox";
import {Archetype, useGetOverviewQuery} from "../../generated/graphql";
import StandardLayout from "../layout/StandardLayout";

const useStyles = makeStyles()((theme: Theme) => ({
	root: {
		flexGrow: 1
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
	const {classes} = useStyles();
	const theme = useTheme();
	const {data, loading, error} = useGetOverviewQuery({pollInterval: 5_000});

	useEffect(() => {
		window.document.title = "Prism";
	}, []);

	const item = (title: string, icon: ReactNode, children: ReactNode, info?: string): ReactNode => {
		return <ListItem>
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
				color="textPrimary">
				{!loading ? children : <CircularProgress
					size={16}
					thickness={8}
				/>}
			</Typography>
		</ListItem>
	}

	return <StandardLayout>
		<div className={classes.root}>
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
			{error && <Alert
				sx={{m: 2}}
				severity="error">
			Something went wrong loading the dashboard: &quot;{getGraphErrorMessage(error)}&quot;
			</Alert>}
			<Grid
				sx={{mt: 2}}
				container
				spacing={1}>
				<Grid
					sx={{overflowY: "auto", maxHeight: 500}}
					item
					xs={6}>
					<Card
						variant="outlined">
						<CardHeader
							sx={{backgroundColor: theme.palette.background.default}}
							title="System information"
						/>
						<Divider/>
						<List
							sx={{p: 0.5}}>
							{item("Artifacts", <ListDetails color={theme.palette.primary.main}/>, data?.getOverview.artifacts.toLocaleString() || 0)}
							{item("Downloads", <CloudDownload color={theme.palette.success.main}/>, data?.getOverview.downloads.toLocaleString() || 0)}
							{item("Remotes", <ArrowsRight color={theme.palette.secondary.main}/>, data?.getOverview.remotes.toLocaleString() || 0)}
							{item("Refractions", <ArrowsSplit color={theme.palette.info.main}/>, data?.getOverview.refractions.toLocaleString() || 0)}
							{item("NPM Indices", getRemoteIcon(theme, Archetype.Npm), data?.getOverview.packages_npm.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
							{item("PyPi Indices", getRemoteIcon(theme, Archetype.Pip), data?.getOverview.packages_pypi.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
							{item("Helm Indices", getRemoteIcon(theme, Archetype.Helm), data?.getOverview.packages_helm.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
							{item("Storage", <CloudUpload color={theme.palette.primary.main}/>, formatBytes(data?.getOverview.storage || 0, false, 0))}
						</List>
					</Card>
				</Grid>
				<Grid
					sx={{overflowY: "auto", maxHeight: 500}}
					item
					xs={6}>
					<Card
						variant="outlined">
						<CardHeader
							sx={{backgroundColor: theme.palette.background.default}}
							title="Getting started"
						/>
						<Divider/>
						<List
							sx={{p: 0.5}}>
							<ListItem>
								<ListItemIcon>
									<Book/>
								</ListItemIcon>
								<ListItemText
									primary={<Link to="/help">
										Getting started with Prism
									</Link>}
									secondary="Learn the fundamentals and get an understanding of what Prism can do for you."
								/>
							</ListItem>
							<ListItem>
								<ListItemIcon>
									<Compass/>
								</ListItemIcon>
								<ListItemText
									primary={<Link to="/help/whats-new">
										What's new with Prism?
									</Link>}
									secondary="Take advantage of new features, fixes and workflows."
								/>
							</ListItem>
						</List>
					</Card>
				</Grid>
			</Grid>
		</div>
	</StandardLayout>
}
export default Dashboard;
