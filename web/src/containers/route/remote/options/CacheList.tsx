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

import React, {useMemo} from "react";
import {Card, List, ListItem, ListItemText, makeStyles} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {formatDistanceToNow} from "date-fns";
import {CacheEntryV1} from "../../../../config/types";
import {ErrorState} from "../../../../domain/errors";
import getErrorMessage from "../../../../selectors/getErrorMessage";

const useStyles = makeStyles(() => ({
	list: {
		maxHeight: 300,
		overflowY: "auto"
	}
}));

interface CacheListProps {
	data: CacheEntryV1[];
	loading: boolean;
	error: ErrorState | null;
}

const CacheList: React.FC<CacheListProps> = ({data, error}): JSX.Element => {
	// hooks
	const classes = useStyles();

	// local state
	const items = useMemo(() => {
		return data.map((d: CacheEntryV1) => <ListItem
			key={d.id}>
			<ListItemText
				primary={d.uri}
				secondary={<>
					Downloaded {d.downloadcount || 0} times&nbsp;&bull;&nbsp;{formatDistanceToNow(new Date(d.updatedAt))}
				</>}
			/>
		</ListItem>);
	}, [data]);
	return (
		<Card
			variant="outlined">
			<List
				className={classes.list}>
				{error == null && items.length === 0 && <Alert
					severity="info">
				No data could be found.
				</Alert>}
				{error != null ? <Alert
					severity="error">
					{getErrorMessage(error)}
				</Alert> : items}
			</List>
		</Card>
	);
}
export default CacheList;
