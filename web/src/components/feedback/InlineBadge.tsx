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

import React from "react";
import {Box} from "@mui/material";
import {useTheme} from "@mui/material/styles";

interface Props {
	colour: string;
}

const InlineBadge: React.FC<Props> = ({colour, children}): JSX.Element => {
	const theme = useTheme();
	return <Box
		sx={{
			borderRadius: theme.spacing(4),
			backgroundColor: colour,
			color: theme.palette.getContrastText(colour),
			paddingLeft: theme.spacing(0.75),
			paddingRight: theme.spacing(0.75),
			paddingBottom: theme.spacing(0.25),
			marginLeft: theme.spacing(1),
			fontSize: 12,
			fontWeight: "bold",
			fontFamily: "Manrope"
		}}>
		{children}
	</Box>
}
export default InlineBadge;
