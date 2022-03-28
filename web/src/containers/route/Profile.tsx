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

import React from "react";
import {Alert, Avatar, Box, CircularProgress, Theme, Tooltip, Typography} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";
import {Skeleton} from "@mui/lab";
import StandardLayout from "../layout/StandardLayout";
import {getInitials, parseUsername} from "../../utils/parse";
import useGetCurrentUser from "../../graph/actions/rbac/useGetCurrentUser";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";

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

	const {data, loading, error} = useGetCurrentUser();

	return <StandardLayout>
		<Box
			sx={{mt: 2, display: "flex", alignItems: "center", flexDirection: "column"}}>
			<Avatar
				style={{width: 96, height: 96, backgroundColor: theme.palette.primary.main}}>
				{loading ? <CircularProgress color="secondary"/> : getInitials(parseUsername(data?.getCurrentUser.sub || ""))}
			</Avatar>
			{error && <Alert
				sx={{textAlign: "center"}}
				severity="error">
				Something went wrong loading your profile.<br/>
				{getGraphErrorMessage(error)}
			</Alert>}
			<Tooltip title={data?.getCurrentUser?.sub || ""}>
				<Typography
					className={classes.title}
					variant="h3">
					{!loading && parseUsername(data?.getCurrentUser?.sub || "")}
					{loading && <Skeleton
						variant="text"
						height={80}
						width={300}
					/>}
				</Typography>
			</Tooltip>
			<Tooltip title={data?.getCurrentUser?.iss || ""}>
				<Typography
					variant="body1">
					{!loading && parseUsername(data?.getCurrentUser?.iss || "")}
					{loading && <Skeleton
						variant="text"
						width={150}
						height={40}
					/>}
				</Typography>
			</Tooltip>
		</Box>
	</StandardLayout>
}
export default Profile;
