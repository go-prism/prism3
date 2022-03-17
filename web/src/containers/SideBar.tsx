import {createStyles, Divider, Drawer, IconButton, makeStyles, Theme, Tooltip} from "@material-ui/core";
import React from "react";
import {Link, useLocation} from "react-router-dom";
import {ArrowsRight, ArrowsSplit, Home, Icon, Settings, User} from "tabler-icons-react";
import {useTheme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => createStyles({
	drawer: {
		backgroundColor: theme.palette.primary.main,
		width: 64,
		flexShrink: 0,
		whiteSpace: "nowrap",
	},
	paper: {
		backgroundColor: theme.palette.primary.main,
		width: 64,
	},
	items: {
		display: "flex",
		flexDirection: "column",
		justifyItems: "center",
		padding: theme.spacing(1)
	},
	item: {
		width: 48,
		height: 48,
	}
}));

interface MenuOption {
	name: string;
	icon: Icon;
	path: string;
}

const generalOptions: MenuOption[] = [
	{
		name: "Overview",
		icon: Home,
		path: "/"
	},
	{
		name: "Remotes",
		icon: ArrowsRight,
		path: "/settings/remotes"
	},
	{
		name: "Refractions",
		icon: ArrowsSplit,
		path: "/settings/refract"
	}
];

const settingOptions: MenuOption[] = [
	{
		name: "User profile",
		icon: User,
		path: "/profile"
	},
	{
		name: "Settings",
		icon: Settings,
		path: "/settings"
	}
]

const SideBar: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const location = useLocation();

	const getListItem = (opt: MenuOption): JSX.Element => {
		return (
			<Tooltip
				title={opt.name}
				placement="right">
				<IconButton
					className={classes.item}
					component={Link}
					to={opt.path}
					color="secondary"
					centerRipple={false}>
					<opt.icon color={theme.palette.primary.contrastText}/>
				</IconButton>
			</Tooltip>
		)
	}

	return (
		<Drawer
			variant="permanent"
			className={classes.drawer}
			classes={{paper: classes.paper}}>
			<div style={{display: "flex", flexDirection: "column", height: "100%"}}>
				<div className={classes.items}>
					{generalOptions.map((opt) => getListItem(opt))}
				</div>
				<div style={{flex: 1}}/>
				<div className={classes.items}>
					{settingOptions.map((opt) => getListItem(opt))}
				</div>
			</div>
		</Drawer>
	);
}
export default SideBar;
