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
import {Settings as SettingsIcon} from "tabler-icons-react";
import {Route, Switch} from "react-router";
import SidebarLayout from "../../layout/SidebarLayout";
import AccessControlSettings from "../acl";
import SimpleSidebar, {SidebarItem} from "../../layout/SimpleSidebar";
import Info from "./Info";
import GoLangSettings from "./GoLangSettings";
import Transports from "./Transports";

export interface IDParams {
	id: string;
}

const Settings: React.FC = (): JSX.Element => {
	useEffect(() => {
		window.document.title = "Settings";
	}, []);

	const settings: SidebarItem[] = [
		{
			id: "div-sec",
			label: "Security",
			type: "header"
		},
		{
			id: "transport",
			label: "Transport profiles",
			to: "/settings/security/transport"
		},
		{
			id: "div-sys",
			label: "System",
			type: "header"
		},
		{
			id: "acl",
			label: "Permissions",
			to: "/settings/sys/acl"
		},
		{
			id: "about",
			label: "About",
			to: "/settings/sys/about"
		},
	]

	return (
		<SidebarLayout
			sidebarWidth={2}
			sidebar={<div>
				<SimpleSidebar
					headerTo="/settings"
					items={settings}
					header="Settings"
					icon={SettingsIcon}
				/>
			</div>}>
			<Switch>
				<Route
					path="/settings/security/transport"
					component={Transports}
				/>
				<Route
					path="/settings/fwk/go"
					component={GoLangSettings}
				/>
				<Route
					path="/settings/sys/about"
					component={Info}
				/>
				<Route
					path="/settings/sys/acl"
					component={AccessControlSettings}
				/>
			</Switch>
		</SidebarLayout>
	);
}
export default Settings;
