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
import {Card, Chip, Divider, Tab, TabProps, Tabs, Theme, Typography, useTheme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import withStyles from "@mui/styles/withStyles";
import {TabContext, TabPanel} from "@mui/lab";
import {formatDistanceToNow} from "date-fns";
import {CirclePlus, Edit, FileDownload} from "tabler-icons-react";
import {MetadataChip} from "../../../config/types";
import {Archetype, Artifact, Refraction} from "../../../generated/graphql";
import GoLangInstall from "./info/setup/GoLangInstall";
import FilePreview from "./info/FilePreview";
import DefaultInstall from "./info/setup/DefaultInstall";
import JavaInstall from "./info/setup/JavaInstall";
import AlpineInstall from "./info/setup/AlpineInstall";
import HelmInstall from "./info/setup/HelmInstall";
import NpmInstall from "./info/setup/NpmInstall";
import PyPiInstall from "./info/setup/PyPiInstall";
import DebianInstall from "./info/setup/DebianInstall";
import GenericInstall from "./info/setup/GenericInstall";

const useStyles = makeStyles()((theme: Theme) => ({
	title: {
		margin: theme.spacing(1),
		fontFamily: "Manrope",
		fontWeight: 500
	},
	chip: {
		margin: theme.spacing(0.5)
	},
	headerCard: {
		padding: theme.spacing(1),
		borderRadius: theme.spacing(0.75)
	}
}));

const StyledTab = withStyles(() => ({
	root: {
		textTransform: "none",
		minWidth: 72
	}
}))((props: TabProps) => <Tab {...props}/>);

interface ObjectInfoProps {
	item: Artifact;
	refraction: Refraction;
}

const ObjectInfo: React.FC<ObjectInfoProps> = ({item, refraction}): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const theme = useTheme();

	// local state
	const [selected, setSelected] = useState<string>("0");
	const name = item.uri.split("/").filter(i => i !== "").pop();

	const chips = useMemo(() => {
		const chipData: MetadataChip[] = [
			{
				label: formatDistanceToNow(new Date(item.createdAt * 1000), {addSuffix: true}),
				icon: CirclePlus
			},
			{
				label: formatDistanceToNow(new Date(item.updatedAt * 1000), {addSuffix: true}),
				icon: Edit
			},
			{
				label: item.downloads.toLocaleString(),
				icon: FileDownload
			}
		];
		return chipData.map(c => <Chip
			className={classes.chip}
			key={c.icon.name}
			label={c.label}
			icon={<c.icon color={theme.palette.text.secondary}/>}
			size="small"
		/>);
	}, [item]);

	const setupInfo = (): ReactNode | null => {
		switch (true) {
			case item.uri.endsWith(".deb"):
				return <DebianInstall uri={item.uri} refraction={refraction.name}/>;
			case item.uri.endsWith(".pom"):
			case item.uri.endsWith(".jar"):
				return <JavaInstall uri={item.uri} refraction={refraction}/>;
			case item.uri.endsWith(".info"):
			case item.uri.endsWith(".mod"):
				return <GoLangInstall uri={item.uri}/>;
			case item.uri.endsWith(".apk"):
				return <AlpineInstall uri={item.uri} refraction={refraction.name}/>;
			case item.uri.endsWith(".tgz") && refraction.archetype === Archetype.Helm:
				return <HelmInstall uri={item.uri} refraction={refraction.name}/>;
			case item.uri.endsWith(".tgz") && refraction.archetype === Archetype.Npm:
				return <NpmInstall uri={item.uri} refraction={refraction.name}/>;
			case item.uri.endsWith(".tar.gz") && refraction.archetype === Archetype.Pip:
				return <PyPiInstall uri={item.uri} refraction={refraction.name} wheel={false}/>;
			case item.uri.endsWith(".whl") && refraction.archetype === Archetype.Pip:
				return <PyPiInstall uri={item.uri} refraction={refraction.name} wheel/>;
			case refraction.archetype === Archetype.Generic:
				return <GenericInstall uri={item.uri} refraction={refraction.name}/>;
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
			<Card
				className={classes.headerCard}
				variant="outlined">
				<Typography
					className={classes.title}
					variant="h5">
					{name}
				</Typography>
				{chips}
			</Card>
			<TabContext
				value={selected}>
				<Tabs
					style={{marginTop: theme.spacing(1)}}
					value={selected}
					onChange={(_, value: number) => setSelected(value.toString())}>
					<StyledTab label="Details" value="0"/>
					<StyledTab label="Raw" value="1" disabled={!allowPreview()}/>
				</Tabs>
				<Divider/>
				<TabPanel
					style={{padding: 0, paddingTop: theme.spacing(2)}}
					value="0">
					<Card
						className={classes.headerCard}
						variant="outlined">
						{setupInfo()}
					</Card>
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
