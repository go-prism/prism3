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

import React, {useEffect, useState} from "react";
import {
	Button,
	Card,
	Checkbox,
	Grid,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Theme,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from "tabler-icons-react";
import {Archetype, Remote, useListRemotesLazyQuery} from "../../../generated/graphql";

const useStyles = makeStyles()((theme: Theme) => ({
	root: {
		margin: "auto",
	},
	paper: {
		width: 200,
		height: 230,
		overflow: "auto",
	},
	button: {
		margin: theme.spacing(0.5, 0),
	},
}));

const not = (a: Remote[], b: Remote[]) => {
	const bid = b.map(r => r.id);
	return a.filter((value) => bid.indexOf(value.id) === -1);
}

const notID = (a: Remote[], b: Remote[]) => {
	return a.filter((value) => b.find(i => i.id === value.id) == null);
}

const intersection = (a: Remote[], b: Remote[]) => {
	const bid = b.map(r => r.id);
	return a.filter((value) => bid.indexOf(value.id) !== -1);
}

const intersectionID = (a: Remote[], b: Remote[]) => {
	return a.filter((value) => b.find(i => i.id === value.id) != null);
}

interface RemoteSelectProps {
	arch: Archetype;
	setRemotes: (remotes: Remote[]) => void;
	defaultRemotes?: Remote[];
	disabled?: boolean;
}

const RemoteSelect: React.FC<RemoteSelectProps> = ({arch, setRemotes, defaultRemotes = [], disabled = false}): JSX.Element => {
	// hooks
	const {classes} = useStyles();

	// global state
	const [listRemotes, {data}] = useListRemotesLazyQuery();

	// local state
	const [checked, setChecked] = useState<Remote[]>([]);
	const [left, setLeft] = useState<Remote[]>([]);
	const [right, setRight] = useState<Remote[]>([]);

	const leftChecked = intersection(checked, left);
	const rightChecked = intersection(checked, right);

	useEffect(() => {
		void listRemotes({variables: {arch}});
	}, [arch]);

	useEffect(() => {
		setRight(notID((data?.listRemotes || []) as Remote[], defaultRemotes || []));
		setLeft(intersectionID((data?.listRemotes || []) as Remote[],defaultRemotes || []));
	}, [data?.listRemotes]);

	useEffect(() => {
		setRemotes(left);
	}, [left]);

	const handleToggle = (value: Remote) => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}
		setChecked(newChecked);
	};

	const handleAllRight = () => {
		setRight(right.concat(left));
		setLeft([]);
	};

	const handleCheckedRight = () => {
		setRight(right.concat(leftChecked));
		setLeft(not(left, leftChecked));
		setChecked(not(checked, leftChecked));
	};

	const handleCheckedLeft = () => {
		setLeft(left.concat(rightChecked));
		setRight(not(right, rightChecked));
		setChecked(not(checked, rightChecked));
	};

	const handleAllLeft = () => {
		setLeft(left.concat(right));
		setRight([]);
	};

	const customList = (items: Remote[]) => (
		<Card
			className={classes.paper}
			variant="outlined">
			<List dense component="div" role="list">
				{items.map((value: Remote) => {
					const labelId = `transfer-list-item-${value}-label`;
					return (
						<ListItemButton
							key={value.id}
							role="listitem"
							disabled={disabled}
							onClick={handleToggle(value)}>
							<ListItemIcon>
								<Checkbox
									checked={checked.indexOf(value) !== -1}
									tabIndex={-1}
									disableRipple
									inputProps={{"aria-labelledby": labelId}}
									disabled={disabled}
									color="primary"
								/>
							</ListItemIcon>
							<ListItemText
								id={labelId}
								primary={value.name}
							/>
						</ListItemButton>
					);
				})}
				<ListItem/>
			</List>
		</Card>
	);

	return (
		<Grid container spacing={2} justifyContent="center" alignItems="center" className={classes.root}>
			<Grid item>
				{customList(left)}
			</Grid>
			<Grid item>
				<Grid container direction="column" alignItems="center">
					<Button
						variant="outlined"
						size="small"
						className={classes.button}
						onClick={handleAllRight}
						disabled={left.length === 0 || disabled}
						aria-label="move all right">
						<ChevronsRight/>
					</Button>
					<Button
						variant="outlined"
						size="small"
						className={classes.button}
						onClick={handleCheckedRight}
						disabled={leftChecked.length === 0 || disabled}
						aria-label="move selected right">
						<ChevronRight/>
					</Button>
					<Button
						variant="outlined"
						size="small"
						className={classes.button}
						onClick={handleCheckedLeft}
						disabled={rightChecked.length === 0 || disabled}
						aria-label="move selected left">
						<ChevronLeft/>
					</Button>
					<Button
						variant="outlined"
						size="small"
						className={classes.button}
						onClick={handleAllLeft}
						disabled={right.length === 0 || disabled}
						aria-label="move all left">
						<ChevronsLeft/>
					</Button>
				</Grid>
			</Grid>
			<Grid item>
				{customList(right)}
			</Grid>
		</Grid>
	);
}
export default RemoteSelect;
