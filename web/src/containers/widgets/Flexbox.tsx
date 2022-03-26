import React from "react";
import {Box} from "@material-ui/core";

const Flexbox: React.FC = ({children}): JSX.Element => <Box
	style={{display: "flex", alignItems: "center"}}>
	{children}
</Box>;
export default Flexbox;
