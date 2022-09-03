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

import {Box, Grid, GridSize} from "@mui/material";
import React, {ReactNode} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {useTheme} from "@mui/material/styles";
import {useLocation} from "react-router-dom";
import Error from "../alert/Error";

interface SidebarLayoutProps {
	sidebar: JSX.Element;
	children: ReactNode;
	sidebarWidth?: GridSize;
}

const DEFAULT_WIDTH = 2;

const SidebarLayout: React.FC<SidebarLayoutProps> = ({sidebar, sidebarWidth = DEFAULT_WIDTH, children}): JSX.Element => {
	const theme = useTheme();
	const location = useLocation();

	const navHeight = location.pathname.startsWith("/artifacts/-/") ? 92 : 52;
	const innerHeight = navHeight + 8;
	const sidebarColour = theme.palette.mode === "light" ? theme.palette.grey["200"] : theme.palette.background.paper;

	return (
		<Grid
			container>
			<Grid
				style={{backgroundColor: sidebarColour, height: `calc(100vh - ${navHeight}px)`, padding: theme.spacing(1)}}
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
				style={{marginLeft: theme.spacing(2), height: `calc(100vh - ${navHeight}px)`, padding: theme.spacing(1)}}
				item
				xs={9}
				sm={8}
				md={6}>
				<ErrorBoundary
					fallbackRender={p => <Error props={p}/>}>
					<Box
						style={{maxHeight: `calc(100vh - ${innerHeight}px)`, overflowY: "auto"}}>
						{children}
					</Box>
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
