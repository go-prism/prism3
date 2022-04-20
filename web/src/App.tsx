import {createTheme, CssBaseline, Theme, ThemeProvider} from "@mui/material";
import React, {useContext} from "react";
import {Route, Switch} from "react-router";
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {makeStyles} from "tss-react/mui";
import {AppContext} from "../store/AppProvider";
import {setCurrentUser, setUserError} from "../store/actions/user";
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
import Browser from "./containers/route/overview/Browser";
import CreateRoleBinding from "./containers/route/acl/CreateRoleBinding";
import Dashboard from "./containers/route/Dashboard";
import CreateTransport from "./containers/route/settings/CreateTransport";
import UserSettings from "./containers/route/UserSettings";
import {useGetCurrentUserQuery} from "./generated/graphql";
import {PREF_DARK_THEME} from "./config/constants";

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
}),
);

const App: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const {dispatch, state: {user}} = useContext(AppContext);

	// global state
	const theme = createTheme({
		palette: user?.preferences[PREF_DARK_THEME] === "true" ? dark : light,
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
			}
		}
	});

	const cache = createCache({
		key: "mui",
		prepend: true
	});
	
	useGetCurrentUserQuery({
		onCompleted: data => {
			dispatch(setCurrentUser(data.getCurrentUser));
		},
		onError: error => dispatch(setUserError(error))
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
									path="/help"
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
