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
import {Avatar, Theme, Tooltip, Typography} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";
import StandardLayout from "../layout/StandardLayout";
import {getInitials, parseUsername} from "../../utils/parse";
import {User} from "../../config/types";

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

	// global hooks
	let currentUser: User = {
		sub: "",
		iss: "",
		claims: {},
		token: "",
		token_hash: ""
	};

	return <StandardLayout>
		<div
			style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
			<Avatar
				style={{width: 96, height: 96, backgroundColor: theme.palette.primary.main}}>
				{getInitials(parseUsername(currentUser?.sub || ""))}
			</Avatar>
			<Tooltip title={currentUser?.sub || ""}>
				<Typography
					className={classes.title}
					variant="h3">
					{parseUsername(currentUser?.sub || "")}
				</Typography>
			</Tooltip>
			<Tooltip title={currentUser?.iss || ""}>
				<Typography
					variant="body1">
					{parseUsername(currentUser?.iss || "")}
				</Typography>
			</Tooltip>
		</div>
	</StandardLayout>
}
export default Profile;
