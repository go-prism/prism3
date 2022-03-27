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

import React, {ReactNode, useEffect} from "react";
import {
	Alert,
	Card,
	IconButton,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Theme,
	Typography,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Link} from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import {Plus} from "tabler-icons-react";
import {parseUsername} from "../../../utils/parse";
import useLoading from "../../../hooks/useLoading";
import getErrorMessage from "../../../selectors/getErrorMessage";
import useErrors from "../../../hooks/useErrors";
import Flexbox from "../../widgets/Flexbox";

const useStyles = makeStyles()((theme: Theme) => ({
	icon: {
		margin: theme.spacing(1),
		marginRight: theme.spacing(2)
	}
}));

interface Role {
	id: string;
	name: string;
	subject: string;
	username: string;
}

const AccessControlSettings: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	// global state
	const roles: Role[] = [];
	const loading = useLoading([]);
	const error = useErrors([]);

	useEffect(() => {
		window.document.title = "Access control";
	}, []);

	const loadingItems = (): ReactNode[] => {
		const items = [];
		for (let i = 0; i < 8; i++) {
			items.push(<TableRow>
				<TableCell>
					<Skeleton
						width="20%"
						variant="text"
						animation="wave"
					/>
				</TableCell>
				<TableCell>
					<Skeleton
						width="20%"
						variant="text"
						animation="wave"
					/>
				</TableCell>
				<TableCell>
					<Skeleton
						width="50%"
						variant="text"
						animation="wave"
					/>
				</TableCell>
			</TableRow>);
		}
		return items;
	}

	return (
		<Card>
			<Flexbox>
				<Typography
					sx={{ml: 2}}>
					Access control
				</Typography>
				<div style={{flexGrow: 1}}/>
				<IconButton
					className={classes.icon}
					component={Link}
					to="/settings/acl/new"
					centerRipple={false}
					size="large">
					<Plus
						color={theme.palette.text.secondary}
						size={20}
					/>
				</IconButton>
			</Flexbox>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Subject</TableCell>
							<TableCell>User</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!loading && error && <TableRow>
							<TableCell colSpan={3}>
								<Alert severity="error">
									{getErrorMessage(error)}
								</Alert>
							</TableCell>
						</TableRow>}
						{loading && loadingItems()}
						{!loading && roles.length === 0 && <TableRow>
							<TableCell colSpan={3}>
								<Alert
									severity="info">
										There are no roles.
								</Alert>
							</TableCell>
						</TableRow>}
						{!loading && roles.map(r => <TableRow
							key={r.id}>
							<TableCell>{r.name}</TableCell>
							<TableCell>{r.subject || "All resources"}</TableCell>
							<TableCell>{parseUsername(r.username)}</TableCell>
						</TableRow>)}
					</TableBody>
				</Table>
			</TableContainer>
		</Card>
	);
}
export default AccessControlSettings;
