import {createTheme, CssBaseline, Theme, ThemeProvider} from "@mui/material";
import React from "react";
import {Route, Switch} from "react-router";
import createCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";
import {makeStyles} from "tss-react/mui";
import {light} from "./style/palette";
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
import Profile from "./containers/route/Profile";
import Dashboard from "./containers/route/Dashboard";

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

	// global state
	const theme = createTheme({
		palette: light,
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
									path="/acl/new"
									exact
									component={CreateRoleBinding}
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
									exact
									component={Profile}
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
