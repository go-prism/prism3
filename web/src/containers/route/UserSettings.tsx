import React, {useEffect} from "react";
import {User} from "tabler-icons-react";
import {Route, Switch} from "react-router";
import SimpleSidebar, {SidebarItem} from "../layout/SimpleSidebar";
import SidebarLayout from "../layout/SidebarLayout";
import Profile from "./Profile";

const UserSettings: React.FC = (): JSX.Element => {
	useEffect(() => {
		window.document.title = "User Settings";
	}, []);

	const settings: SidebarItem[] = [
		{
			id: "profile",
			label: "Profile",
			to: "/profile"
		},
		{
			id: "preferences",
			label: "Preferences",
			to: "/profile/preferences"
		}
	];
	
	return <SidebarLayout
		sidebarWidth={2}
		sidebar={<SimpleSidebar
			items={settings}
			header="User Settings"
			icon={User}
			headerTo="/profile"
		/>}>
		<Switch>
			<Route
				exact
				path="/profile"
				component={Profile}
			/>
		</Switch>
	</SidebarLayout>
}
export default UserSettings;
