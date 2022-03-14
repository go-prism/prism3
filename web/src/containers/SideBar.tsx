import clsx from "clsx";
import {
	createStyles,
	Divider,
	Drawer,
	fade,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	makeStyles,
	Theme
} from "@material-ui/core";
import React from "react";
import Icon from "@mdi/react";
import {useTheme} from "@material-ui/core/styles";
import {
	mdiAccountMultipleOutline,
	mdiAccountOutline,
	mdiCallSplit,
	mdiChevronLeft,
	mdiChevronRight,
	mdiCogOutline,
	mdiServer,
	mdiViewDashboardOutline
} from "@mdi/js";
import {Link, useLocation} from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => createStyles({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: "nowrap",
	},
	drawerOpen: {
		width: drawerWidth,
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	drawerClose: {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		overflowX: "hidden",
		width: theme.spacing(7) + 1,
		[theme.breakpoints.up("sm")]: {
			width: theme.spacing(9) + 1,
		},
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
	},
	item: {
		paddingLeft: theme.spacing(3),
		borderRadius: theme.spacing(theme.spacing(0.5), 0, 0, theme.spacing(0.5)),
		"&.Mui-selected": {
			color: theme.palette.primary.main,
			backgroundColor: fade(theme.palette.primary.light, 0.16)
		},
	},
	title: {
		fontFamily: "Manrope",
		fontWeight: 600,
		fontSize: 14
	}
}));

interface SideBarProps {
	open: boolean;
	onClose: () => void;
}

interface MenuOption {
	name: string;
	icon: string;
	path: string;
}

const generalOptions: MenuOption[] = [
	{
		name: "Overview",
		icon: mdiViewDashboardOutline,
		path: "/"
	}
];

const refOptions: MenuOption[] = [
	{
		name: "Remotes",
		icon: mdiServer,
		path: "/settings/remotes"
	},
	{
		name: "Refractions",
		icon: mdiCallSplit,
		path: "/settings/refract"
	}
];

const settingOptions: MenuOption[] = [
	{
		name: "Access control",
		icon: mdiAccountMultipleOutline,
		path: "/settings/acl"
	},
	{
		name: "User profile",
		icon: mdiAccountOutline,
		path: "/profile"
	},
	{
		name: "Settings",
		icon: mdiCogOutline,
		path: "/settings"
	}
]

const SideBar: React.FC<SideBarProps> = ({open, onClose}): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const location = useLocation();

	const getListItem = (opt: MenuOption): JSX.Element => {
		return (
			<ListItem
				className={classes.item}
				button
				selected={location.pathname === opt.path}
				component={Link}
				to={opt.path}
				key={opt.name}>
				<ListItemIcon>
					<Icon
						path={opt.icon}
						size={1}
						color={theme.palette.text.secondary}
					/>
				</ListItemIcon>
				<ListItemText
					primaryTypographyProps={{className: classes.title}}>
					{opt.name}
				</ListItemText>
			</ListItem>
		)
	}

	return (
		<Drawer
			variant="permanent"
			className={clsx(classes.drawer, {
				[classes.drawerOpen]: open,
				[classes.drawerClose]: !open,
			})}
			classes={{
				paper: clsx({
					[classes.drawerOpen]: open,
					[classes.drawerClose]: !open,
				}),
			}}>
			<div className={classes.toolbar}>
				<IconButton onClick={onClose}>
					<Icon
						path={theme.direction === "rtl" ? mdiChevronRight : mdiChevronLeft}
						size={1}
						color={theme.palette.text.secondary}
					/>
				</IconButton>
			</div>
			<Divider/>
			<List>
				{generalOptions.map((opt) => getListItem(opt))}
			</List>
			<Divider/>
			<List>
				{refOptions.map((opt) => getListItem(opt))}
			</List>
			<Divider/>
			<List>
				{settingOptions.map((opt) => getListItem(opt))}
			</List>
		</Drawer>
	);
}
export default SideBar;
