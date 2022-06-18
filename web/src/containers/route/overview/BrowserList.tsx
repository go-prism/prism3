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

import React, {useState} from "react";
import {DataGrid, GridColDef, GridColumnVisibilityModel} from "@mui/x-data-grid";
import {Box, Drawer, Typography} from "@mui/material";
import {format} from "date-fns";
import {useTheme} from "@mui/material/styles";
import {ApolloError} from "@apollo/client";
import {getNodeColour, getNodeIcon} from "../../../utils/remote";
import {Artifact, Refraction} from "../../../generated/graphql";
import InlineError from "../../alert/InlineError";
import {BrowserProps} from "./Browser";
import ObjectInfo from "./ObjectInfo";

const BrowserList: React.FC<BrowserProps> = ({data, error, loading}): JSX.Element => {
	const theme = useTheme();
	const [hide, setHide] = useState<GridColumnVisibilityModel>({
		"id": false,
		"uri": true,
		"updatedAt": true,
		"downloads": true
	});
	const [selected, setSelected] = useState<Artifact | null>(null);

	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "UUID",
			sortable: true,
			type: "string",
			minWidth: 300,
			flex: 1
		},
		{
			field: "uri",
			headerName: "URI",
			sortable: true,
			type: "string",
			minWidth: 400,
			flex: 1,
			renderCell: params => {
				const Icon = getNodeIcon(params.value);
				const colour = getNodeColour(theme, params.value);
				return <Box
					sx={{display: "flex", alignItems: "center"}}>
					<Icon
						color={colour[0]}
					/>
					<span
						style={{marginLeft: theme.spacing(1)}}>
						{params.value}
					</span>
				</Box>
			}
		},
		{
			field: "updatedAt",
			headerName: `Modified (${format(Date.now(), "O")})`,
			sortable: true,
			type: "date",
			flex: 1,
			valueFormatter: ({value}) => {
				return format(value * 1000, "yyyy/MM/dd HH:mm");
			}
		},
		{
			field: "downloads",
			headerName: "Downloads",
			sortable: true,
			type: "number",
			flex: 1,
			maxWidth: 150
		}
	];

	const errorOverlay = ({error}: {error: ApolloError | undefined}) => <Box
		sx={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%"}}>
		<InlineError error={error}/>
	</Box>

	return <Box
		sx={{height: "calc(100vh - 112px)", maxHeight: "calc(100vh - 112px)"}}>
		<DataGrid
			columnVisibilityModel={hide}
			onColumnVisibilityModelChange={model => setHide(() => model)}
			components={{ErrorOverlay: errorOverlay}}
			componentsProps={{errorOverlay: {error: error}}}
			loading={loading}
			error={error}
			autoPageSize
			columns={columns}
			rows={data?.listCombinedArtifacts || []}
			onRowClick={params => setSelected(() => params.row as Artifact)}
		/>
		<Drawer
			anchor="right"
			elevation={8}
			PaperProps={{sx: {maxWidth: 500, width: 500, p: 1}}}
			open={selected != null}
			onClose={() => setSelected(() => null)}>
			<Box>
				{selected != null && data != null && <ObjectInfo
					item={selected}
					refraction={data.getRefraction as Refraction}
				/>}
				<Typography
					sx={{m: 1}}
					color="textSecondary"
					variant="caption">
					Click anywhere on the left to dismiss this drawer.
				</Typography>
			</Box>
		</Drawer>
	</Box>
}
export default BrowserList;
