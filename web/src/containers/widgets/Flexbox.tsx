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

interface Props {
	inline?: boolean;
}

const Flexbox: React.FC<Props> = ({inline = false, children}): JSX.Element => <Box
	sx={{
		display: inline === true ? "inline-flex" : "flex",
		alignItems: "center"
	}}>
	{children}
</Box>;
export default Flexbox;
