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
import React, {useMemo} from "react";
import {format} from "date-fns";
import {CloudDownload, Database, Icon, LayersLinked, WorldDownload} from "tabler-icons-react";
import {useTheme} from "@mui/material/styles";
import {BandwidthType, useGetBandwidthQuery, useGetTotalBandwidthQuery} from "../../../../generated/graphql";
import InlineError from "../../../alert/InlineError";
import {formatBytes} from "../../../../utils/format";

interface Props {
	type: string;
	id: string;
}

const BandwidthOpts: React.FC<Props> = ({type, id}): JSX.Element => {
	// hooks
	const theme = useTheme();
	const today = format(new Date(), "yyyyMM");
	const currentUsage = useGetBandwidthQuery({variables: {resource: `${type}::${id}`, date: today}});
	const totalUsage = useGetTotalBandwidthQuery({variables: {resource: `${type}::${id}`}});

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

	const data = useMemo(() => {
		const d = new Map<BandwidthType, [number, number]>();
		// initialise the data
		d.set(BandwidthType.NetworkA, [0, 0]);
		d.set(BandwidthType.NetworkB, [0, 0]);
		d.set(BandwidthType.Storage, [0, 0]);
		// collect the monthly stats
		currentUsage.data?.getBandwidthUsage.forEach(v => d.set(v.type, [v.usage, 0]));
		// fill in totals
		totalUsage.data?.getTotalBandwidthUsage.forEach(v => {
			const e = d.get(v.type)!;
			d.set(v.type, [e[0], v.usage]);
		});
		return d;
	}, [currentUsage.data, totalUsage.data]);

	if (currentUsage.error || totalUsage.error) {
		return <InlineError error={currentUsage.error || totalUsage.error}/>
	}

	return <List>
		{[...data.entries()].map(([key, [current, total]]) => {
			const [title, desc, icon, colour] = getBandwidth(key);
			return <ListItem
				key={key}>
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
						{formatBytes(current)}&nbsp;({formatBytes(total)})
					</Typography>
				</ListItemSecondaryAction>
			</ListItem>
		})}
	</List>
}
export default BandwidthOpts;
