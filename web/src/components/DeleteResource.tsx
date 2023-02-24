/*
 *    Copyright 2023 Django Cass
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

import React, {useState} from "react";
import {Box, Button, FormControlLabel, Switch} from "@mui/material";

interface Props {
	onDelete: () => void;
}

const DeleteResource: React.FC<Props> = ({onDelete}): JSX.Element => {
	const [consent, setConsent] = useState<boolean>(false);

	return <Box
		sx={{padding: 2, display: "flex"}}>
		<FormControlLabel
			sx={{width: "100%"}}
			control={<Switch checked={consent}/>}
			value={consent}
			onChange={(e, c) => setConsent(() => c)}
			label="I understand that this action is permanent and cannot be undone."
		/>
		<Button
			sx={{textTransform: "none"}}
			variant="outlined"
			color="error"
			disabled={!consent}
			onClick={onDelete}>
			Delete
		</Button>
	</Box>
}
export default DeleteResource;
