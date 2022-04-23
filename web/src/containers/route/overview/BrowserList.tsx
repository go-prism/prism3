import React, {useState} from "react";
import {DataGrid, GridColDef, GridColumnVisibilityModel} from "@mui/x-data-grid";
import {Box, Drawer} from "@mui/material";
import {format} from "date-fns";
import {useTheme} from "@mui/material/styles";
import {getNodeColour, getNodeIcon} from "../../../utils/remote";
import {Artifact, Refraction} from "../../../generated/graphql";
import {BrowserProps} from "./Browser";
import ObjectInfo from "./ObjectInfo";

const BrowserList: React.FC<BrowserProps> = ({data, error}): JSX.Element => {
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

	return <Box
		sx={{height: "calc(100vh - 112px)", maxHeight: "calc(100vh - 112px)"}}>
		<DataGrid
			columnVisibilityModel={hide}
			onColumnVisibilityModelChange={model => setHide(() => model)}
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
			{selected != null && data != null && <ObjectInfo
				item={selected}
				refraction={data.getRefraction as Refraction}
			/>}
		</Drawer>
	</Box>
}
export default BrowserList;
