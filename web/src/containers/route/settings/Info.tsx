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

import {
	Avatar,
	Card,
	Divider,
	ListItem,
	ListItemAvatar,
	ListItemText,
	ListSubheader,
	makeStyles,
	Theme
} from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
	item: {
		padding: theme.spacing(1)
	}
}));

const Info: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();

	return (
		<div>
			<ListSubheader>About Prism</ListSubheader>
			<Card>
				<ListItem>
					<ListItemAvatar>
						<Avatar
							alt="App icon"
							src="/favicon.png"
						/>
					</ListItemAvatar>
					<ListItemText
						className={classes.item}
						primaryTypographyProps={{
							color: "textPrimary",
							variant: "h5"
						}}>
						Prism
					</ListItemText>
				</ListItem>
				<Divider/>
				<ListItem>
					<ListItemText
						className={classes.item}
						secondary={`Version ${import.meta.env.VERSION} (${import.meta.env.REVISION || "unknown commit"})`}
					/>
				</ListItem>
			</Card>
		</div>
	);
}
export default Info;
