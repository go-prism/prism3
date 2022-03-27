/*
 *    Copyright 2021 Django Cass
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

import React, {ReactNode} from "react";
import {
	Button,
	Collapse,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	Theme,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {GenericIconButton} from "jmp-coreui";
import {mdiChevronDown, mdiChevronUp} from "@mdi/js";

const useStyles = makeStyles()((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: 600,
		textTransform: "none"
	},
	card: {
		margin: theme.spacing(1)
	}
}));

interface ExpandableListItemProps {
	primary: string;
	secondary?: string;
	open: boolean;
	setOpen: (o: boolean) => void;
	icon?: ReactNode;
	disabled?: boolean;
}

const ExpandableListItem: React.FC<ExpandableListItemProps> = ({primary, secondary, open, setOpen, icon, disabled, children}): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

	const toggle = (): void => {
		setOpen(!open);
	}

	return (
		<>
			<ListItem>
				{icon != null && <ListItemIcon>
					{icon}
				</ListItemIcon>}
				<ListItemText
					primary={primary}
					primaryTypographyProps={{
						className: classes.title,
						variant: "h6",
						color: "textPrimary"
					}}
					secondary={secondary}
				/>
				<ListItemSecondaryAction>
					{isSmallScreen ? <GenericIconButton
						title={open ? "Collapse" : "Expand"}
						icon={open ? mdiChevronUp : mdiChevronDown}
						colour={theme.palette.text.secondary}
						onClick={toggle}
						disabled={disabled}
					/>
						:
						<Button
							className={classes.button}
							onClick={toggle}
							disabled={disabled}
							variant="outlined">
							{open ? "Collapse" : "Expand"}
						</Button>}
				</ListItemSecondaryAction>
			</ListItem>
			<Collapse in={open && !disabled}>
				<div
					className={classes.card}>
					{children}
				</div>
			</Collapse>
		</>
	);
}
export default ExpandableListItem;
