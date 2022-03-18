import React, {ReactNode, useMemo, useState} from "react";
import {
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	makeStyles,
	Theme,
	Typography
} from "@material-ui/core";
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
	itemHeader: {
		textTransform: "uppercase",
		fontSize: 12
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
	type?: "item" | "header";
	to?: string;
	icon?: ReactNode;
}

interface SimpleSidebarProps {
	items: SidebarItem[];
	onSelection?: (val: SidebarItem) => void;
	header: string;
	headerTo?: string;
	icon: Icon;
	loading?: boolean;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({items, onSelection, header, headerTo, loading, ...props}): JSX.Element => {
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

	const getHeader = (s: SidebarItem): ReactNode => <ListSubheader
		className={classes.itemHeader}
		key={s.id}>
		{s.label}
	</ListSubheader>

	const getItem = (s: SidebarItem): ReactNode => <ListItem
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
			primary={`• ${s.label}`}
			primaryTypographyProps={{className: classes.title}}
		/>
	</ListItem>

	const getElement = (s: SidebarItem): ReactNode => {
		switch (s.type) {
			case "header":
				return getHeader(s);
			default:
				return getItem(s);
		}
	}

	return <div>
		<List>
			<ListItem
				className={classes.item}
				component={headerTo ? Link : "div"}
				to={headerTo}
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
			{!loading && items.map(s => getElement(s))}
		</List>
	</div>
}
export default SimpleSidebar;
