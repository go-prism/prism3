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

import {List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Typography} from "@mui/material";
import React from "react";
import {format} from "date-fns";
import {CloudDownload, Database, Icon, LayersLinked, WorldDownload} from "tabler-icons-react";
import {useTheme} from "@mui/material/styles";
import {BandwidthType, useGetBandwidthQuery} from "../../../../generated/graphql";
import InlineError from "../../../alert/InlineError";
import InlineNotFound from "../../../widgets/InlineNotFound";
import {formatBytes} from "../../../../utils/format";

interface Props {
	type: string;
	id: string;
}

const BandwidthOpts: React.FC<Props> = ({type, id}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const today = format(new Date(), "yyyyMM");
	const {data, loading, error} = useGetBandwidthQuery({variables: {resource: `${type}::${id}`, date: today}});

	const getBandwidth = (t: string): [string, string, Icon, string] => {
		switch (t) {
			case BandwidthType.NetworkA:
				return ["Network Class A", "Data transferred between Prism and the internet.", WorldDownload, theme.palette.secondary.main];
			case BandwidthType.NetworkB:
				return ["Network Class B", "Data transferred between Prism and the client.", CloudDownload, theme.palette.primary.main];
			case BandwidthType.Storage:
				return ["Storage", "Data stored in Prism.", Database, theme.palette.primary.main];
			default:
				return [t, "Unknown data usage.", LayersLinked, theme.palette.text.disabled];
		}
	}

	if (error) {
		return <InlineError error={error}/>
	}

	if (!loading && (data?.getBandwidthUsage.length || 0) === 0) {
		return <InlineNotFound/>
	}

	return <List>
		{data && data.getBandwidthUsage.map(u => {
			const [title, desc, icon, colour] = getBandwidth(u.type);
			return <ListItem
				key={u.id}>
				<ListItemIcon>
					{React.createElement(icon, {color: colour})}
				</ListItemIcon>
				<ListItemText
					primaryTypographyProps={{color: "textPrimary"}}
					primary={title}
					secondary={desc}
				/>
				<ListItemSecondaryAction>
					<Typography
						color="textSecondary">
						{formatBytes(u.usage)}
					</Typography>
				</ListItemSecondaryAction>
			</ListItem>
		})}
	</List>
}
export default BandwidthOpts;
