/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import React, {ReactNode, useEffect, useMemo} from "react";
import {
	Alert,
	Avatar,
	Box,
	CircularProgress,
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
	Clock,
	CloudDownload,
	CloudUpload,
	Compass,
	InfoCircle,
	ListDetails,
	Recharging,
	Users
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
import Widget from "./dashboard/Widget";

const useStyles = makeStyles()((theme: Theme) => ({
	root: {
		flexGrow: 1
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 0,
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
		return <ListItem
			key={title}>
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

	const sysInfo = useMemo((): ReactNode[] => {
		const rawItems: ReactNode[] | undefined[] = [
			(data?.getOverview.storage || 0) > 0 && item("Storage", <CloudUpload color={theme.palette.primary.main}/>, formatBytes(data?.getOverview.storage || 0, false, 0)),
			(data?.getOverview.uptime || 0) > 0&& item("Uptime", <Clock color={theme.palette.text.secondary}/>, formatDistanceStrict(Date.now(), data?.getOverview.uptime || 0)),
			(data?.getOverview.users || 0) > 0 && item("Users", <Users color={theme.palette.secondary.main}/>, data?.getOverview.users.toLocaleString() || 0),
			(data?.getOverview.system_memory || 0) > 0 && item("Memory", <Recharging color={theme.palette.text.secondary}/>, formatBytes(data?.getOverview.system_memory || 0, false, 0), "Current memory allocation."),
			(data?.getOverview.system_memory_os || 0) > 0 && item("Memory (OS)", <Recharging color={theme.palette.text.secondary}/>, formatBytes(data?.getOverview.system_memory_os || 0, false, 0), "Memory allocated by the OS."),
			(data?.getOverview.system_memory_total || 0) > 0 && item("Memory (total)", <Recharging color={theme.palette.text.secondary}/>, formatBytes(data?.getOverview.system_memory_total || 0, false, 0), "Total allocated memory.")
		];
		return rawItems.filter(n => n != null && n !== false);
	}, [data?.getOverview, theme.palette]);

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
			{error && <Alert
				sx={{mt: 2, mb: 2}}
				severity="error">
				Something went wrong loading the dashboard: &quot;{getGraphErrorMessage(error)}&quot;
			</Alert>}
			<Grid
				sx={{mt: 2}}
				container
				spacing={1}>
				<Widget title="Statistics">
					<List
						sx={{p: 0.5}}>
						{item("Artifacts", <ListDetails color={theme.palette.primary.main}/>, data?.getOverview.artifacts.toLocaleString() || 0)}
						{item("Downloads", <CloudDownload color={theme.palette.success.main}/>, data?.getOverview.downloads.toLocaleString() || 0)}
						{item("Remotes", <ArrowsRight color={theme.palette.secondary.main}/>, data?.getOverview.remotes.toLocaleString() || 0)}
						{item("Refractions", <ArrowsSplit color={theme.palette.info.main}/>, data?.getOverview.refractions.toLocaleString() || 0)}
						{item("NPM Indices", getRemoteIcon(theme, Archetype.Npm), data?.getOverview.packages_npm.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
						{item("PyPi Indices", getRemoteIcon(theme, Archetype.Pip), data?.getOverview.packages_pypi.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
						{item("Helm Indices", getRemoteIcon(theme, Archetype.Helm), data?.getOverview.packages_helm.toLocaleString() || 0, "Indices refer to packages that Prism is aware of, but may not have cached.")}
					</List>
				</Widget>
				<Widget title="Getting started">
					<List
						sx={{p: 0.5}}>
						<ListItem>
							<ListItemIcon>
								<Book/>
							</ListItemIcon>
							<ListItemText
								primary={<Link to="/help/user-overview">
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
								primary={<Link to="/help/user-changelog">
									What's new with Prism?
								</Link>}
								secondary="Take advantage of new features, improvements and workflows."
							/>
						</ListItem>
					</List>
				</Widget>
				{sysInfo.length > 0 && <Widget title="System information">
					<List
						sx={{p: 0.5}}>
						{sysInfo}
					</List>
				</Widget>}
			</Grid>
		</div>
	</StandardLayout>
}
export default Dashboard;
