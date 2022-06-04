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

import {createTheme, CssBaseline, Theme, ThemeProvider} from "@mui/material";
import React, {useEffect, useMemo} from "react";
import {Route, Switch} from "react-router";
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {makeStyles} from "tss-react/mui";
import {dark, light} from "./style/palette";
import Nav from "./containers/Nav";
import SideBar from "./containers/SideBar";
import NotFound from "./containers/route/NotFound";
import Remotes from "./containers/route/settings/Remotes";
import Refractions from "./containers/route/settings/Refractions";
import CreateRemote from "./containers/route/remote/Create";
import CreateRefract from "./containers/route/refract/Create";
import Overview from "./containers/route/Overview";
import Help from "./containers/route/Help";
import Settings from "./containers/route/settings";
import CreateRoleBinding from "./containers/route/acl/CreateRoleBinding";
import Dashboard from "./containers/route/Dashboard";
import CreateTransport from "./containers/route/settings/CreateTransport";
import UserSettings from "./containers/route/UserSettings";
import {useWatchCurrentUserSubscription} from "./generated/graphql";
import {PREF_DARK_THEME} from "./config/constants";
import Browser from "./containers/route/overview/Browser";

const useStyles = makeStyles()((theme: Theme) => ({
	root: {
		display: "flex",
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		padding: theme.spacing(0, 1),
		height: 48
	},
	content: {
		flexGrow: 1
	},
}));

const App: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const {data} = useWatchCurrentUserSubscription();

	// global state
	const theme = useMemo(() => {
		return createTheme({
			palette: data?.getCurrentUser.preferences[PREF_DARK_THEME] === "true" ? dark : light,
			components: {
				MuiTooltip: {
					styleOverrides: {
						tooltip: {
							fontSize: "0.9rem"
						}
					}
				},
				MuiListSubheader: {
					styleOverrides: {
						root: {
							backgroundColor: "transparent"
						}
					}
				},
				MuiOutlinedInput: {
					styleOverrides: {
						root: {
							borderRadius: 8
						},
					}
				},
				MuiInputLabel: {
					styleOverrides: {
						shrink: {
							color: "text.primary",
							fontWeight: 500
						}
					}
				},
				MuiButton: {
					styleOverrides: {
						root: {
							borderRadius: 8
						}
					}
				}
			}
		});
	}, [data]);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme.palette.mode);
	}, [theme.palette.mode]);

	const cache = createCache({
		key: "mui",
		prepend: true
	});

	return (
		<div>
			<CacheProvider value={cache}>
				<ThemeProvider theme={theme}>
					<div
						className={classes.root}>
						<CssBaseline/>
						<Nav/>
						<SideBar/>
						<main className={classes.content}>
							<div className={classes.toolbar}/>
							<Switch>
								<Route
									path="/"
									exact
									component={Dashboard}
								/>
								<Route
									path="/artifacts"
									exact
									component={Overview}
								/>
								<Route
									path="/artifacts/-/:ref"
									exact
									component={Browser}
								/>
								<Route
									path="/remotes"
									exact
									component={Remotes}
								/>
								<Route
									path="/remote/:id/-/edit"
									component={Remotes}
								/>
								<Route
									path="/refract"
									exact
									component={Refractions}
								/>
								<Route
									path="/refract/:id/-/edit"
									component={Refractions}
								/>
								<Route
									path="/settings/acl/new"
									exact
									component={CreateRoleBinding}
								/>
								<Route
									path="/settings/transport/new"
									exact
									component={CreateTransport}
								/>
								<Route
									path="/remotes/new"
									component={CreateRemote}
								/>
								<Route
									path="/refract/new"
									component={CreateRefract}
								/>
								<Route
									path="/settings"
									component={Settings}
								/>
								<Route
									path="/profile"
									component={UserSettings}
								/>
								<Route
									path="/help/:path"
									component={Help}
								/>
								<Route component={NotFound}/>
							</Switch>
						</main>
					</div>
				</ThemeProvider>
			</CacheProvider>
		</div>
	);
};
export default App;
