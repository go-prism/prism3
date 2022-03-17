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

import React, {ReactNode, useEffect, useState} from "react";
import {Avatar, makeStyles, Paper, Theme, Typography} from "@material-ui/core";
import Center from "react-center";
import {Settings as SettingsIcon} from "tabler-icons-react";
import SidebarLayout from "../../layout/SidebarLayout";
import AccessControlSettings from "../acl";
import SimpleSidebar from "../../layout/SimpleSidebar";
import Info from "./Info";
import GoLangSettings from "./GoLangSettings";
import ReactorSettings from "./ReactorSettings";
import Transports from "./Transports";

export interface IDParams {
	id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		color: theme.palette.grey["700"],
		fontWeight: 500,
		fontSize: 15
	},
	item: {
		borderRadius: theme.spacing(1),
		color: theme.palette.primary.main
	},
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
	const [selected, setSelected] = useState<ReactNode | null>(null);

	useEffect(() => {
		window.document.title = "Settings";
	}, []);

	const content = new Map<string, ReactNode>([
		["transport", <Transports key="transport"/>],
		["about", <Info key="about"/>],
		["go", <GoLangSettings key="go"/>],
		["reactor", <ReactorSettings key="reactor"/>],
		["acl", <AccessControlSettings key="acl"/>]
	]);

	const settings = [
		{
			id: "transport",
			label: "Transport profiles"
		},
		{
			id: "go",
			label: "GoProxy"
		},
		{
			id: "reactor",
			label: "System",
		},
		{
			id: "acl",
			label: "Permissions"
		},
		{
			id: "about",
			label: "About"
		},
	]

	return (
		<SidebarLayout
			sidebarWidth={2}
			sidebar={<div>
				<SimpleSidebar
					items={settings}
					header="Settings"
					icon={SettingsIcon}
					onSelection={val => setSelected(content.get(val.id))}
				/>
			</div>}>
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
			{selected}
		</SidebarLayout>
	);
}
export default Settings;
