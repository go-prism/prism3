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

import React, {ReactNode, useEffect} from "react";
import {
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
import Flexbox from "../../widgets/Flexbox";
import InlineNotFound from "../../widgets/InlineNotFound";
import {getResourceIcon, getResourceName} from "../../../utils/remote";
import {RoleBinding, useGetRoleBindingsQuery} from "../../../generated/graphql";
import InlineError from "../../alert/InlineError";

const useStyles = makeStyles()((theme: Theme) => ({
	icon: {
		margin: theme.spacing(1),
		marginRight: theme.spacing(2)
	}
}));

const AccessControlSettings: React.FC = (): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	// state
	const {data, loading, error} = useGetRoleBindingsQuery({variables: {user: ""}});
	const roles: RoleBinding[] = data?.getRoleBindings || [];

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
		<Card
			variant="outlined">
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
							<TableCell>Subject</TableCell>
							<TableCell>Resource</TableCell>
							<TableCell>Verbs</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!loading && error && <TableRow>
							<TableCell colSpan={3}>
								<InlineError error={error}/>
							</TableCell>
						</TableRow>}
						{loading && loadingItems()}
						{error == null && !loading && roles.length === 0 && <TableRow>
							<TableCell colSpan={3}>
								<InlineNotFound/>
							</TableCell>
						</TableRow>}
						{!loading && roles.map(r => <TableRow
							key={JSON.stringify(r)}>
							<TableCell>{parseUsername(r.subject)}</TableCell>
							<TableCell>{r.resource.includes("::") ? <Flexbox>
								{getResourceIcon(theme, r.resource)}
								{getResourceName(r.resource)}
							</Flexbox> : `${r.resource} (all resources)`}</TableCell>
							<TableCell>
								{r.verb}
							</TableCell>
						</TableRow>)}
					</TableBody>
				</Table>
			</TableContainer>
		</Card>
	);
}
export default AccessControlSettings;
