import {Box, Grid, GridSize} from "@mui/material";
import React, {ReactNode} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {useTheme} from "@mui/material/styles";
import Error from "../alert/Error";

interface SidebarLayoutProps {
	sidebar: JSX.Element;
	children: ReactNode;
	sidebarWidth?: GridSize;
}

const DEFAULT_WIDTH = 2;

const SidebarLayout: React.FC<SidebarLayoutProps> = ({sidebar, sidebarWidth = DEFAULT_WIDTH, children}): JSX.Element => {
	const theme = useTheme();
	return (
		<Grid
			container>
			<Grid
				style={{backgroundColor: theme.palette.grey["200"], height: "calc(100vh - 52px)", padding: theme.spacing(1)}}
				item
				xs={sidebarWidth || DEFAULT_WIDTH}>
				<ErrorBoundary
					fallbackRender={p => <Error props={p}/>}>
					<Box
						style={{maxHeight: "calc(100vh - 96px)", overflowY: "auto"}}>
						{sidebar}
					</Box>
				</ErrorBoundary>
			</Grid>
			<Grid
				style={{margin: theme.spacing(2)}}
				item
				xs={9}
				sm={8}
				md={6}>
				<ErrorBoundary
					fallbackRender={p => <Error props={p}/>}>
					{children}
				</ErrorBoundary>
			</Grid>
			<Grid
				item
				xs={false}
				sm={1}
				md={3}
			/>
		</Grid>
	);
}
export default SidebarLayout;
