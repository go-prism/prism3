/*
 *    Copyright 2021 Django Cass
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

import React, {useEffect, useState} from "react";
import {
	Alert,
	Avatar,
	Box,
	Card,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	ListSubheader,
	Theme,
	Typography
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";
import {Skeleton} from "@mui/lab";
import StandardLayout from "../layout/StandardLayout";
import {getInitials, parseUsername} from "../../utils/parse";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";
import InlineNotFound from "../widgets/InlineNotFound";
import {SimpleMap} from "../../domain";
import {useWatchCurrentUserSubscription} from "../../generated/graphql";

const useStyles = makeStyles()((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		margin: theme.spacing(1)
	}
}));

const Profile: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const {data, loading, error} = useWatchCurrentUserSubscription();
	const [claims, setClaims] = useState<SimpleMap<string>>({});

	useEffect(() => {
		if (data?.getCurrentUser == null)
			return;
		const c: SimpleMap<string> = {};
		Object.entries(data.getCurrentUser.claims).forEach(([k, v]) => {
			c[k.toLocaleLowerCase()] = v as string;
		});
		setClaims(() => c);
	}, [data?.getCurrentUser]);

	const hasPicture = claims["picture"] as string | undefined;
	const displayName = claims["nickname"] || claims["name"] || parseUsername(data?.getCurrentUser.sub || "");

	return <StandardLayout>
		<Box
			sx={{mt: 2, display: "flex", alignItems: "center", flexDirection: "column"}}>
			<Avatar
				style={{width: 96, height: 96, backgroundColor: theme.palette.primary.main}}
				src={hasPicture}>
				{loading && <CircularProgress color="secondary"/>}
				{!loading && !hasPicture && getInitials(displayName)}
			</Avatar>
			{error && <Alert
				sx={{textAlign: "center"}}
				severity="error">
				Something went wrong loading your profile.<br/>
				{getGraphErrorMessage(error)}
			</Alert>}
			<Typography
				className={classes.title}
				variant="h3">
				{!loading && displayName}
				{loading && <Skeleton
					variant="text"
					height={80}
					width={300}
				/>}
			</Typography>
			<Typography
				variant="body1">
				{!loading && parseUsername(data?.getCurrentUser.iss || "")}
				{loading && <Skeleton
					variant="text"
					width={150}
					height={40}
				/>}
			</Typography>
			<Card
				sx={{mt: 2}}
				variant="outlined">
				<List
					sx={{maxHeight: 400, overflowY: "auto"}}>
					<ListSubheader
						disableSticky>
						General
					</ListSubheader>
					<ListItem>
						<ListItemText
							primary="Username"
							secondary={data?.getCurrentUser.sub || <Skeleton/>}
						/>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="Issuer"
							secondary={data?.getCurrentUser.iss || <Skeleton/>}
						/>
					</ListItem>
					<ListSubheader
						disableSticky>
						OIDC Claims
					</ListSubheader>
					{Object.keys(claims).length === 0 && <InlineNotFound
						title="No claims"
						subtitle="Claims are only present when using an OIDC provider."
					/>}
					{Object.entries(claims).map(([k, v]) => <ListItem
						key={k}>
						<ListItemText
							primary={k}
							secondary={v as string}
						/>
					</ListItem>)}
				</List>
			</Card>
		</Box>
	</StandardLayout>
}
export default Profile;
