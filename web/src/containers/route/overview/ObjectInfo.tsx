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

import React, {ReactNode, useMemo, useState} from "react";
import {
	Chip,
	createStyles,
	Divider,
	makeStyles,
	Tab,
	TabProps,
	Tabs,
	Theme,
	Typography,
	useTheme,
	withStyles
} from "@material-ui/core";
import {Alert, TabContext, TabPanel} from "@material-ui/lab";
import {mdiDownload, mdiPencilOutline, mdiPlusCircleOutline} from "@mdi/js";
import Icon from "@mdi/react";
import {formatDistanceToNow} from "date-fns";
import {MetadataChip} from "../../../config/types";
import {Archetype, Artifact, Refraction} from "../../../graph/types";
import GoLangInstall from "./info/setup/GoLangInstall";
import FilePreview from "./info/FilePreview";
import DefaultInstall from "./info/setup/DefaultInstall";
import JavaInstall from "./info/setup/JavaInstall";
import AlpineInstall from "./info/setup/AlpineInstall";
import HelmInstall from "./info/setup/HelmInstall";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		margin: theme.spacing(1),
		fontFamily: "Manrope",
		fontWeight: 500
	},
	alert: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1)
	},
	chip: {
		margin: theme.spacing(0.5)
	}
}));

const StyledTab = withStyles(() => createStyles({
	root: {
		textTransform: "none",
		minWidth: 72
	}
}))((props: TabProps) => <Tab disableRipple {...props}/>);

interface ObjectInfoProps {
	item: Artifact;
	refraction: Refraction;
}

const ObjectInfo: React.FC<ObjectInfoProps> = ({item, refraction}): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();

	// local state
	const [selected, setSelected] = useState<string>("0");

	const chips = useMemo(() => {
		const chipData: MetadataChip[] = [
			{
				label: formatDistanceToNow(new Date(item.createdAt * 1000), {addSuffix: true}),
				icon: mdiPlusCircleOutline
			},
			{
				label: formatDistanceToNow(new Date(item.updatedAt * 1000), {addSuffix: true}),
				icon: mdiPencilOutline
			},
			{
				label: item.downloads,
				icon: mdiDownload
			}
		];
		return chipData.map(c => <Chip
			className={classes.chip}
			key={c.icon}
			label={c.label}
			icon={<Icon
				path={c.icon}
				size={0.75}
				color={theme.palette.text.secondary}
			/>}
			size="small"
		/>);
	}, [item]);

	const setupInfo = (): ReactNode | null => {
		switch (true) {
			case item.uri.endsWith(".pom"):
			case item.uri.endsWith(".jar"):
				return <JavaInstall uri={item.uri} refraction={refraction}/>;
			case item.uri.endsWith(".info"):
			case item.uri.endsWith(".mod"):
				return <GoLangInstall uri={item.uri}/>;
			case item.uri.endsWith(".apk"):
				return <AlpineInstall uri={item.uri} refraction={refraction.name}/>;
			case item.uri.endsWith(".tgz") && refraction.archetype === Archetype.HELM:
				return <HelmInstall uri={item.uri} refraction={refraction.name}/>;
			default:
				return <DefaultInstall uri={item.uri}/>;
		}
	}

	const allowPreview = (): boolean => {
		return item.uri.endsWith(".info") ||
			item.uri.endsWith(".mod") ||
			item.uri.endsWith(".pom") ||
			item.uri.endsWith(".pom.sha1") ||
			item.uri.endsWith(".jar.sha1") ||
			item.uri.endsWith(".xml");
	}

	return (
		<div>
			<Typography
				className={classes.title}
				variant="h5">
				{item.uri}
			</Typography>
			{chips}
			{item.uri.endsWith("APKINDEX.tar.gz") && <Alert
				className={classes.alert}
				severity="warning">
				This file is an index and cannot currently be cached by Prism.
			</Alert>}
			<TabContext
				value={selected}>
				<Tabs
					value={selected}
					onChange={(_, value: number) => setSelected(value.toString())}>
					<StyledTab label="Details" value="0"/>
					<StyledTab label="Raw" value="1" disabled={!allowPreview()}/>
				</Tabs>
				<Divider/>
				<TabPanel
					value="0">
					{setupInfo()}
				</TabPanel>
				{allowPreview() && <TabPanel
					value="1">
					<FilePreview
						uri={item.uri}
						refraction={refraction.name}
					/>
				</TabPanel>}
			</TabContext>
		</div>
	);
}
export default ObjectInfo;
