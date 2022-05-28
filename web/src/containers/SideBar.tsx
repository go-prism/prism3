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

import {Divider, Drawer, ListItemButton, ListItemIcon, ListItemText, Theme, Tooltip} from "@mui/material";
import React, {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {
	ArrowsRight,
	ArrowsSplit,
	ChevronsLeft,
	ChevronsRight,
	Dashboard,
	Icon,
	ListDetails,
	Settings,
	User
} from "tabler-icons-react";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";
import {Role, useUserHasQuery} from "../generated/graphql";

export const SIDEBAR_WIDTH_CLOSED = 64;
export const SIDEBAR_WIDTH_OPEN = 300;

interface StyleProps {
	open: boolean;
}

const useStyles = makeStyles<StyleProps>()((theme: Theme, {open}) => ({
	drawer: {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		backgroundColor: theme.palette.background.paper,
		width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
		flexShrink: 0,
		whiteSpace: "nowrap",
	},
	paper: {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		backgroundColor: theme.palette.background.paper,
		width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
		marginTop: 52,
		paddingBottom: 52
	},
	items: {
		display: "flex",
		flexDirection: "column",
		justifyItems: "center",
		padding: theme.spacing(1)
	},
	item: {
		transition: theme.transitions.create("paddingLeft", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		width: open ? undefined : 48,
		height: 48,
		paddingLeft: theme.spacing(open ? 2 : 1.5)
	},
	itemBase: {
		borderRadius: theme.spacing(0.75)
	}
}));

interface MenuOption {
	name: string;
	icon: Icon;
	path?: string;
	onClick?: () => void;
	hidden?: boolean;
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

const SideBar: React.FC = (): JSX.Element => {
	// hooks
	const [open, setOpen] = useState<boolean>(false);
	const {classes} = useStyles({open});
	const theme = useTheme();
	const location = useLocation();
	const hasSuperUser = useUserHasQuery({variables: {role: Role.Super}});

	const settingOptions: MenuOption[] = [
		{
			name: "User profile",
			icon: User,
			path: "/profile"
		},
		{
			name: "Settings",
			icon: Settings,
			path: "/settings",
			hidden: !hasSuperUser
		}
	];

	const getListItem = (opt: MenuOption): JSX.Element => {
		const item = <ListItemButton
			className={`${classes.itemBase} ${classes.item}`}
			selected={location.pathname === opt.path}
			component={opt.path ? Link : "div"}
			to={opt.path || ""}
			onClick={opt.onClick}>
			<ListItemIcon>
				<opt.icon color={theme.palette.primary.main}/>
			</ListItemIcon>
			<ListItemText
				primaryTypographyProps={{color: theme.palette.text.primary}}>
				{opt.name}
			</ListItemText>
		</ListItemButton>;

		if (open)
			return item;

		return <Tooltip
			key={opt.path}
			title={opt.name}
			placement="right">
			{item}
		</Tooltip>
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
					{settingOptions.filter(o => !o.hidden).map((opt) => getListItem(opt))}
					<Divider light/>
					{getListItem({
						name: open ? "Collapse sidebar" : "Expand sidebar",
						icon: open ? ChevronsLeft : ChevronsRight,
						onClick: () => setOpen(o => !o)
					})}
				</div>
			</div>
		</Drawer>
	);
}
export default SideBar;
