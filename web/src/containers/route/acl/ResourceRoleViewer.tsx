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

import React, {ReactNode} from "react";
import {Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {mdiDeleteOutline} from "@mdi/js";
import {GenericIconButton} from "jmp-coreui";
import InlineError from "../../alert/InlineError";
import InlineNotFound from "../../widgets/InlineNotFound";
import {parseUsername} from "../../../utils/parse";
import {RoleBinding, useGetUsersQuery} from "../../../generated/graphql";

interface Props {
	type: string;
	id: string;
}

const ResourceRoleViewer: React.FC<Props> = ({type, id}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const {data, loading, error} = useGetUsersQuery({variables: {resource: `${type}::${id}`}});
	const roles: RoleBinding[] = data?.getUsers || [];

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
	
	return <TableContainer>
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Subject</TableCell>
					<TableCell align="right">Verbs</TableCell>
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
					<TableCell>
						{parseUsername(r.subject)}
					</TableCell>
					<TableCell align="right">
						{r.verb}
						<GenericIconButton
							title="Delete"
							icon={mdiDeleteOutline}
							colour={theme.palette.error.main}
						/>
					</TableCell>
				</TableRow>)}
			</TableBody>
		</Table>
	</TableContainer>
}
export default ResourceRoleViewer;
