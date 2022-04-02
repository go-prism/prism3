import {
	Button,
	ButtonGroup,
	CircularProgress,
	ClickAwayListener,
	Grow,
	MenuItem,
	MenuList,
	Paper,
	Popper,
	Theme,
	Toolbar,
	Tooltip
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import React, {useEffect, useRef, useState} from "react";
import {ChevronDown} from "tabler-icons-react";
import {gql, useQuery} from "@apollo/client";
import {Link, useHistory} from "react-router-dom";
import {Refraction} from "../../../graph/types";
import {toTitleCase} from "../../../utils/format";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";

const useStyles = makeStyles()((theme: Theme) => ({
	toolbar: {
		height: 38,
		minHeight: 38
	},
	button: {
		textTransform: "none",
		fontWeight: 400,
		height: 24,
		minHeight: 24,
		maxHeight: 24,
		paddingTop: 0,
		paddingBottom: 0
	},
	divider: {
		height: 2,
		backgroundColor: theme.palette.text.disabled,
		opacity: 0.24
	}
}));

interface QueryData {
	listRefractions: Refraction[];
}

interface Props {
	id: string;
}

const BrowserToolbar: React.FC<Props> = ({id}): JSX.Element => {
	// hooks
	const {classes} = useStyles();
	const history = useHistory();
	const {data, loading, error} = useQuery<QueryData, void>(gql`
		query refSelect {
			listRefractions {
				id
				name
            }
		}
	`);

	// local state
	const [open, setOpen] = useState<boolean>(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState<Refraction | null>(null);

	const onClickItem = (i: Refraction): void => {
		setSelected(() => i);
		setOpen(false);
		history.push(`/artifacts/-/${i.id}`);
	}

	useEffect(() => {
		if (data?.listRefractions == null)
			return;
		if (selected != null)
			return;
		for (let i = 0; i < data.listRefractions.length; i++) {
			if (data.listRefractions[i].id === id) {
				setSelected(() => data.listRefractions[i]);
				return;
			}
		}
	}, [data?.listRefractions]);

	const onClose = (e: Event): void => {
		if (anchorRef.current?.contains(e.target as HTMLElement)) {
			return;
		}
		setOpen(false);
	}

	return <>
		<Toolbar
			className={classes.toolbar}
			variant="dense">
			{loading && <CircularProgress size={16}/>}
			{!loading && <ButtonGroup
				className={classes.button}
				variant="text"
				ref={anchorRef}>
				<Button
					className={classes.button}
					disabled={selected == null}
					component={Link}
					to={`/refract/${selected?.id}/-/edit`}>
					{selected?.name || ""}
				</Button>
				<Button
					size="small"
					onClick={() => setOpen(p => !p)}>
					<ChevronDown width={16}/>
				</Button>
			</ButtonGroup>}
			{error != null && <Tooltip
				title={getGraphErrorMessage(error)}>
				<Button
					className={classes.button}
					color="error">
					Error
				</Button>
			</Tooltip>}
			<Popper
				open={open}
				anchorEl={anchorRef.current}
				transition>
				{({TransitionProps, placement}) => (<Grow
					{...TransitionProps}
					style={{transformOrigin: placement === "bottom" ? "center top" : "center bottom"}}>
					<Paper>
						<ClickAwayListener
							onClickAway={onClose}>
							<MenuList
								autoFocusItem>
								{data?.listRefractions.map(i => <MenuItem
									key={i.id}
									selected={selected?.id === i.id}
									onClick={() => onClickItem(i)}>
									{toTitleCase(i.name)}
								</MenuItem>)}
							</MenuList>
						</ClickAwayListener>
					</Paper>
				</Grow>)}
			</Popper>
		</Toolbar>
		<div className={classes.divider}/>
	</>
}
export default BrowserToolbar;