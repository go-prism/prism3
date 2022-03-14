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

import React, {useEffect} from "react";
import {Avatar, makeStyles, Paper, Theme, Typography} from "@material-ui/core";
import Center from "react-center";
import StandardLayout from "../../layout/StandardLayout";
import Info from "./Info";
import GoLang from "./GoLang";
import Reactor from "./Reactor";
import Roles from "./Roles";

export interface IDParams {
	id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
	name: {
		fontFamily: "Manrope",
		fontWeight: 500,
		color: theme.palette.secondary.main,
		margin: theme.spacing(2)
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 100,
		margin: 24,
		padding: 6,
		backgroundColor: theme.palette.background.default
	},
}));


const Settings: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();

	useEffect(() => {
		window.document.title = "Settings";
	}, []);

	return (
		<StandardLayout>
			<Center>
				<Avatar
					className={classes.avatar}
					component={Paper}
					src="/favicon.png"
					alt="App icon"
				/>
			</Center>
			<Typography
				className={classes.name}
				variant="h4"
				align="center">
				Settings
			</Typography>
			<GoLang/>
			<Reactor/>
			<Roles/>
			<Info/>
		</StandardLayout>
	);
}
export default Settings;
