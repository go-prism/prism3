/*
 *    Copyright 2021 Django Cass
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
import {Alert} from "@mui/material";

interface DefaultInstallProps {
	uri: string;
}

const DefaultInstall: React.FC<DefaultInstallProps> = (): JSX.Element => {
	return (
		<div>
			<Alert
				severity="info">
				There are no details available for this file.
			</Alert>
		</div>
	)
}
export default DefaultInstall;
