import React, {useEffect, useMemo} from "react";
import {
	Button,
	Divider,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	makeStyles,
	Theme,
	Typography
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {useTheme} from "@material-ui/core/styles";
import {Alert} from "@material-ui/lab";
import {ListItemSkeleton} from "jmp-coreui";
import StandardLayout from "../../layout/StandardLayout";
import {getRemoteIcon} from "../../../utils/remote";
import useListRefractions from "../../../graph/actions/remote/useListRefractions";
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

const Refractions: React.FC = (): JSX.Element => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();

	// global state
	const {data, loading, error} = useListRefractions();

	useEffect(() => {
		window.document.title = "Refractions";
	}, []);

	// local state
	const items = useMemo(() => {
		if (data?.listRefractions == null)
			return [];
		return data.listRefractions.map(r => (<ListItem
			button
			component={Link}
			to={`/settings/refract/${r.id}/-/edit`}
			key={r.id}>
			<ListItemIcon>
				{getRemoteIcon(theme, r.archetype)}
			</ListItemIcon>
			<ListItemText>
				{r.name}
			</ListItemText>
		</ListItem>))
	}, [data?.listRefractions]);

	return (
		<StandardLayout>
			<div
				className={classes.header}>
				<Typography
					variant="h4"
					color="textPrimary">
					Refractions
				</Typography>
				<div className={classes.grow}/>
				<Button
					className={classes.button}
					component={Link}
					disabled={error != null}
					to="/refract/new"
					color="primary"
					variant="contained">
					New refraction
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
					Failed to load refractions.<br/>
					{getGraphErrorMessage(error)}
				</Alert>}
				{!loading && error == null && items.length === 0 && <Alert
					severity="info">
					No refractions
				</Alert>}
				{items}
			</List>
		</StandardLayout>
	);
}
export default Refractions;
