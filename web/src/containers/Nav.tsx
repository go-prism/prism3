/*
 *    Copyright 2019 Django Cass
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

import React, {useState} from "react";
import {AppBar, Avatar, IconButton, makeStyles, Popover, Theme, Toolbar, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import Icon from "@mdi/react";
import {mdiAccountCircleOutline, mdiHelpCircleOutline, mdiMenu} from "@mdi/js";
import {useTheme} from "@material-ui/core/styles";
import clsx from "clsx";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => ({
	grow: {
		flexGrow: 1
	},
	brand: {
		paddingRight: 8,
		[theme.breakpoints.up("sm")]: {
			paddingRight: 0
		},
		fontFamily: "Manrope",
		fontWeight: 500,
		pointerEvents: "none"
	},
	title: {
		display: "none",
		[theme.breakpoints.up("sm")]: {
			display: "block"
		},
		fontFamily: "Manrope",
		pointerEvents: "none"
	},
	sectionDesktop: {
		marginRight: theme.spacing(1),
		display: "none",
		[theme.breakpoints.up("md")]: {
			display: "flex"
		}
	},
	menuIcon: {
		paddingRight: theme.spacing(1)
	},
	avatar: {
		cursor: "pointer",
		width: 24,
		height: 24,
		borderRadius: 100,
		margin: 12,
		padding: 6,
		backgroundColor: theme.palette.background.default
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(["width", "margin"], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		color: theme.palette.background.default
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(["width", "margin"], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginRight: 36,
		marginLeft: theme.spacing(0.5)
	},
	hide: {
		display: "none",
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
	},
}));

interface NavProps {
	loading?: boolean;
	open: boolean;
	onOpen: () => void;
}

const Nav: React.FC<NavProps> = ({loading = false, open, onOpen}: NavProps): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();

	// global state
	const oidcEnabled = false;

	// local state
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleMenuClose = (): void => {
		setAnchorEl(null);
	};

	return (
		<div>
			<AppBar
				position="fixed"
				color="inherit"
				className={clsx(classes.appBar, {
					[classes.appBarShift]: open,
				})}>
				<Toolbar
					className={classes.toolbar}>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={onOpen}
						edge="start"
						className={clsx(classes.menuButton, {
							[classes.hide]: open,
						})}>
						<Icon
							path={mdiMenu}
							size={1}
							color={theme.palette.text.secondary}
						/>
					</IconButton>
					<Avatar
						className={classes.avatar}
						src="/favicon.png"
						alt="Prism logo"
						component={Link}
						to="/"
					/>
					<Typography
						className={classes.brand}
						variant="h6"
						color="textPrimary">
							Prism
					</Typography>
					<Typography
						className={classes.title}
						variant="h6"
						color="textSecondary">
							DEV
					</Typography>
					<div className={classes.grow}/>
					<div className={classes.sectionDesktop}>
						<IconButton
							style={{margin: 8}}
							disabled={loading}
							component={Link}
							centerRipple={false}
							size="small"
							color="inherit"
							to="/help">
							<Icon
								path={mdiHelpCircleOutline}
								size={1}
								color={theme.palette.text.secondary}
							/>
						</IconButton>
						{oidcEnabled && <IconButton
							style={{margin: 8}}
							disabled={loading}
							component={Link}
							centerRipple={false}
							size="small"
							color="inherit"
							to="/auth/redirect">
							<Icon
								path={mdiAccountCircleOutline}
								size={1}
								color={theme.palette.text.secondary}
							/>
						</IconButton>}
					</div>
				</Toolbar>
			</AppBar>
			<Popover
				anchorEl={anchorEl}
				anchorOrigin={{vertical: "top", horizontal: "right"}}
				transformOrigin={{vertical: "top", horizontal: "right"}}
				open={anchorEl != null && !loading}
				onClose={handleMenuClose}>
			</Popover>
		</div>
	);
};
export default Nav;
