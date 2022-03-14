import React, {useEffect, useMemo} from "react";
import {
	Button,
	Divider,
	List,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles,
	Theme,
	Tooltip,
	Typography
} from "@material-ui/core";
import {Link} from "react-router-dom";
import Icon from "@mdi/react";
import {mdiCheckCircle, mdiCircle} from "@mdi/js";
import {useTheme} from "@material-ui/core/styles";
import {Alert} from "@material-ui/lab";
import {ListItemSkeleton} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import {getRemoteIcon} from "../../../utils/remote";
import useListRemotes from "../../../graph/actions/remote/useListRemotes";
import {Archetype} from "../../../graph/types";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";

const useStyles = makeStyles((theme: Theme) => ({
	header: {
		display: "flex",
		marginBottom: theme.spacing(1)
	},
	grow: {
		flexGrow: 1
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: 600,
		fontSize: 13,
		textTransform: "none",
		height: 36
	}
}));

const Remotes: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();

	// global state
	const [listRemotes, {data, loading, error}] = useListRemotes();

	useEffect(() => {
		window.document.title = "Remotes";
		void listRemotes({variables: {arch: Archetype.NONE}});
	}, []);

	// local state
	const items = useMemo(() => {
		if (data?.listRemotes == null)
			return [];
		return data.listRemotes.map(r => (<ListItem
			button
			component={Link}
			to={`/settings/remotes/${r.id}/-/edit`}
			key={r.id}>
			<ListItemIcon>
				{getRemoteIcon(theme, r.archetype)}
			</ListItemIcon>
			<ListItemText
				secondary={r.uri}>
				{r.name}
			</ListItemText>
			<ListItemSecondaryAction>
				<Tooltip
					title={r.enabled ? "This remote is enabled" : "This remote is disabled"}>
					<Icon
						path={r.enabled ? mdiCheckCircle : mdiCircle}
						size={1}
						color={r.enabled ? theme.palette.success.main : theme.palette.text.secondary}
					/>
				</Tooltip>
			</ListItemSecondaryAction>
		</ListItem>))
	}, [data?.listRemotes]);

	return (
		<StandardLayout>
			<div
				className={classes.header}>
				<Typography
					variant="h4"
					color="textPrimary">
					Remotes
				</Typography>
				<div className={classes.grow}/>
				<Button
					className={classes.button}
					component={Link}
					disabled={error != null}
					to="/remotes/new"
					color="primary"
					variant="contained">
					New remote
				</Button>
			</div>
			<Divider/>
			<List>
				{loading && <div>
					<ListItemSkeleton icon/>
					<ListItemSkeleton icon/>
					<ListItemSkeleton icon/>
					<ListItemSkeleton icon/>
				</div>}
				{!loading && error != null && <Alert
					severity="error">
					Failed to load remotes.<br/>
					{getGraphErrorMessage(error)}
				</Alert>}
				{!loading && error == null && items.length === 0 && <Alert
					severity="info">
					No remotes
				</Alert>}
				{items}
			</List>
		</StandardLayout>
	);
}
export default Remotes;
