import React from "react";
import {Alert, AlertTitle} from "@mui/material";

const NotFound: React.FC = (): JSX.Element => {
	return (
		<div>
			<Alert
				severity="error">
				<AlertTitle>
					Page not found
				</AlertTitle>
				This page cannot be found, or the server refused to disclose it.
			</Alert>
		</div>
	);
}
export default NotFound;
