import {createMuiTheme, createStyles, CssBaseline, makeStyles, MuiThemeProvider, Theme} from "@material-ui/core";
import React, {useState} from "react";
import {Route, Switch} from "react-router";
import {light} from "./style/palette";
import Nav from "./containers/Nav";
import SideBar from "./containers/SideBar";
import NotFound from "./containers/route/NotFound";
import Remotes from "./containers/route/settings/Remotes";
import Refractions from "./containers/route/settings/Refractions";
import CreateRemote from "./containers/route/remote/Create";
import EditRemote from "./containers/route/remote/Edit";
import EditRefract from "./containers/route/refract/Edit";
import CreateRefract from "./containers/route/refract/Create";
import Overview from "./containers/route/Overview";
import Help from "./containers/route/Help";
import Settings from "./containers/route/settings";
import GoLangSettings from "./containers/route/settings/GoLangSettings";
import ReactorSettings from "./containers/route/settings/ReactorSettings";
import Browser from "./containers/route/overview/Browser";
import AccessControlSettings from "./containers/route/acl";
import CreateRoleBinding from "./containers/route/acl/CreateRoleBinding";
import Profile from "./containers/route/Profile";

const useStyles = makeStyles((theme: Theme) => createStyles({
	root: {
		display: "flex",
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
	},
}),
);

const App: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();

	// global state
	const theme = createMuiTheme({
		palette: light,
		overrides: {
			MuiTooltip: {
				tooltip: {
					fontSize: "0.9rem"
				}
			}
		}
	});

	// local state
	const [open, setOpen] = useState<boolean>(false);

	const handleClose = (): void => {
		setOpen(false);
	}

	const handleOpen = (): void => {
		setOpen(true);
	}

	return (
		<div>
			<MuiThemeProvider theme={theme}>
				<div
					className={classes.root}>
					<CssBaseline/>
					<Nav
						open={open}
						onOpen={handleOpen}
					/>
					<SideBar
						open={open}
						onClose={handleClose}
					/>
					<main className={classes.content}>
						<div className={classes.toolbar}/>
						<Switch>
							<Route
								path="/"
								exact
								component={Overview}
							/>
							<Route
								path="/-/:ref"
								exact
								component={Browser}
							/>
							<Route
								path="/settings/remotes"
								exact
								component={Remotes}
							/>
							<Route
								path="/settings/refract"
								exact
								component={Refractions}
							/>
							<Route
								path="/settings/acl"
								exact
								component={AccessControlSettings}
							/>
							<Route
								path="/settings/acl/new"
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
								exact
							/>
							<Route
								path="/settings/plugin/golang"
								component={GoLangSettings}
								exact
							/>
							<Route
								path="/settings/core/reactor"
								component={ReactorSettings}
								exact
							/>
							<Route
								path="/settings/remotes/:id/-/edit"
								component={EditRemote}
							/>
							<Route
								path="/settings/refract/:id/-/edit"
								component={EditRefract}
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
			</MuiThemeProvider>
		</div>
	);
};
export default App;