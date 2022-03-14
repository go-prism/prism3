import {Box, Grid} from "@material-ui/core";
import React, {ReactNode} from "react";
import {ErrorBoundary} from "react-error-boundary";
import Error from "../alert/Error";

interface SidebarLayoutProps {
	sidebar: JSX.Element;
	children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({sidebar, children}): JSX.Element => {
	return (
		<Grid
			container>
			<Grid
				item
				xs={3}>
				<ErrorBoundary
					fallbackRender={p => <Error props={p}/>}>
					<Box
						style={{maxHeight: "calc(100vh - 112px)", overflowY: "auto"}}>
						{sidebar}
					</Box>
				</ErrorBoundary>
			</Grid>
			<Grid
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
