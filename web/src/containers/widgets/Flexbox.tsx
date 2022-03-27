import React from "react";
import {Box} from "@mui/material";

const Flexbox: React.FC = ({children}): JSX.Element => <Box
	sx={{display: "flex", alignItems: "center"}}>
	{children}
</Box>;
export default Flexbox;
