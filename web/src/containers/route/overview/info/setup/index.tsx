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

import React, {ReactNode, useState} from "react";
import {makeStyles, MenuItem, Select, Theme, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		marginBottom: theme.spacing(1),
		marginLeft: theme.spacing(1)
	},
	code: {
		margin: theme.spacing(0.5)
	},
	titlebar: {
		display: "flex"
	},
	divider: {
		flexGrow: 1
	},
	select: {
		maxHeight: 36,
		height: 36
	}
}));

export interface SetupVariants {
	name: string;
	install: ReactNode;
	config: ReactNode;
}

interface LanguageInstallProps {
	variants: SetupVariants[];
}

const LanguageInstall: React.FC<LanguageInstallProps> = ({variants}): JSX.Element => {
	// hooks
	const classes = useStyles();

	// local state
	const [selected, setSelected] = useState<number>(0);

	const handleChange = (e: React.ChangeEvent<{value: unknown}>): void => {
		setSelected(e.target.value as number);
	}

	return (
		<div>
			<div className={classes.titlebar}>
				<Typography
					className={classes.title}
					color="textPrimary"
					variant="h6">
					Installation
				</Typography>
				<div className={classes.divider}/>
				{variants.length > 1 && <Select
					className={classes.select}
					variant="outlined"
					value={selected}
					onChange={handleChange}>
					{variants.map((v, idx) => <MenuItem
						key={v.name}
						value={idx}>
						{v.name}
					</MenuItem>)}
				</Select>}
			</div>
			{variants[selected].install}
			<Typography
				className={classes.title}
				color="textPrimary"
				variant="h6">
				Registry setup
			</Typography>
			{variants[selected].config}
		</div>
	);
}
export default LanguageInstall;
