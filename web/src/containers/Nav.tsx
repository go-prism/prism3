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
import {AppBar, Avatar, ButtonBase, IconButton, Popover, Theme, Toolbar, Typography,} from "@mui/material";
import {Link} from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import {makeStyles} from "tss-react/mui";
import {Help, User} from "tabler-icons-react";
import {API_URL} from "../config";

const drawerWidth = 64;

const useStyles = makeStyles()((theme: Theme) => ({
	grow: {
		flexGrow: 1
	},
	brandButton: {
		borderRadius: theme.spacing(1),
		paddingRight: theme.spacing(1),
		height: 40
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
		width: 24,
		height: 24,
		borderRadius: 100,
		margin: 12,
		padding: 6,
		backgroundColor: theme.palette.background.default
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`
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
		padding: theme.spacing(0, 1)
	},
}));

interface NavProps {
	loading?: boolean;
}

const Nav: React.FC<NavProps> = ({loading = false}: NavProps): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	// global state
	const oidcEnabled = true;

	// local state
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleMenuClose = (): void => {
		setAnchorEl(null);
	};

	return (
		<div>
			<AppBar
				elevation={0}
				variant="outlined"
				position="fixed"
				color="inherit"
				className={classes.appBarShift}>
				<Toolbar
					className={classes.toolbar}
					variant="dense">
					<ButtonBase
						className={classes.brandButton}
						component={Link}
						to="/">
						<Avatar
							className={classes.avatar}
							src="/favicon.png"
							alt="Prism logo"
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
					</ButtonBase>
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
							<Help color={theme.palette.text.secondary}/>
						</IconButton>
						{oidcEnabled && <IconButton
							style={{margin: 8}}
							disabled={loading}
							centerRipple={false}
							size="small"
							color="inherit"
							href={`${API_URL}/auth/redirect`}
							rel="noopener noreferrer">
							<User color={theme.palette.text.secondary}/>
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
