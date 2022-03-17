import React, {ReactNode, useMemo, useState} from "react";
import {List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import {ArrowsSplit, Icon} from "tabler-icons-react";
import {ListItemSkeleton} from "jmp-coreui";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		color: theme.palette.grey["700"],
		fontWeight: 500,
		fontSize: 15
	},
	item: {
		borderRadius: theme.spacing(1),
		color: theme.palette.primary.main
	},
	header: {
		fontFamily: "Manrope",
		fontWeight: 600,
		fontSize: 20,
		margin: theme.spacing(2),
		marginLeft: 0
	},
	headerIconBg: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.palette.primary.main,
		width: 48,
		height: 48,
		borderRadius: theme.spacing(0.75)
	},
	headerIcon: {
		color: theme.palette.primary.contrastText
	}
}));

export interface SidebarItem {
	id: string;
	label: string;
	to?: string;
	icon?: ReactNode;
}

interface SimpleSidebarProps {
	items: SidebarItem[];
	onSelection?: (val: SidebarItem) => void;
	header: string;
	icon: Icon;
	loading?: boolean;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({items, onSelection, header, loading, ...props}): JSX.Element => {
	// hooks
	const classes = useStyles();
	const [selected, setSelected] = useState<SidebarItem | null>(null);

	const onSetSelection = (val: SidebarItem): void => {
		onSelection?.(val);
		setSelected(() => val);
	}

	const loadItems = useMemo(() => {
		if (!loading)
			return [];
		const items = [];
		for (let i = 0; i < 6; i++) {
			items.push(<ListItemSkeleton/>);
		}
		return items;
	}, [loading]);

	return <div>
		<List>
			<ListItem
				className={classes.item}
				button
				key="header">
				<ListItemIcon>
					<div className={classes.headerIconBg}>
						<props.icon className={classes.headerIcon}/>
					</div>
				</ListItemIcon>
				<ListItemText
					primaryTypographyProps={{className: classes.header}}>
					{header}
				</ListItemText>
			</ListItem>
			{loadItems}
			{!loading && items.map(s => <ListItem
				className={classes.item}
				key={s.id}
				selected={s.label === selected?.label}
				button
				component={s.to ? Link : "div"}
				to={s.to}
				onClick={() => onSetSelection(s)}>
				{s.icon && <ListItemIcon>
					{s.icon}
				</ListItemIcon>}
				<ListItemText
					primary={s.label}
					primaryTypographyProps={{className: classes.title}}
				/>
			</ListItem>)}
		</List>
	</div>
}
export default SimpleSidebar;
