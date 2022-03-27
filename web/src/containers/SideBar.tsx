import {ButtonBase, Drawer, Theme, Tooltip} from "@mui/material";
import React from "react";
import {Link} from "react-router-dom";
import {ArrowsRight, ArrowsSplit, Dashboard, Icon, ListDetails, Settings, User} from "tabler-icons-react";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
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
		borderRadius: theme.spacing(0.75)
	}
}));

interface MenuOption {
	name: string;
	icon: Icon;
	path: string;
}

const generalOptions: MenuOption[] = [
	{
		name: "Dashboard",
		icon: Dashboard,
		path: "/"
	},
	{
		name: "Artifacts",
		icon: ListDetails,
		path: "/artifacts"
	},
	{
		name: "Remotes",
		icon: ArrowsRight,
		path: "/remotes"
	},
	{
		name: "Refractions",
		icon: ArrowsSplit,
		path: "/refract"
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
	const {classes} = useStyles();
	const theme = useTheme();

	const getListItem = (opt: MenuOption): JSX.Element => {
		return (
			<Tooltip
				key={opt.path}
				title={opt.name}
				placement="right">
				<ButtonBase
					className={classes.item}
					focusRipple
					component={Link}
					to={opt.path}
					color="secondary">
					<opt.icon color={theme.palette.primary.contrastText}/>
				</ButtonBase>
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
