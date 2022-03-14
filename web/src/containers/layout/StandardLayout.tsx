import {Grid} from "@material-ui/core";
import React from "react";
import {ErrorBoundary} from "react-error-boundary";
import Error from "../alert/Error";

const StandardLayout: React.FC = ({children}): JSX.Element => {
	return (
		<Grid
			container>
			<Grid
				item
				xs={false}
				sm={1}
				md={3}
			/>
			<Grid
				item
				xs={12}
				sm={10}
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
export default StandardLayout;
