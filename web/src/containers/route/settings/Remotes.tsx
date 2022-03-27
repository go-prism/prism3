import React, {useEffect, useMemo} from "react";
import {Alert, Button, Typography, useTheme} from "@mui/material";
import {ArrowsRight} from "tabler-icons-react";
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import useListRemotes from "../../../graph/actions/remote/useListRemotes";
import {Archetype} from "../../../graph/types";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import SidebarLayout from "../../layout/SidebarLayout";
import SimpleSidebar, {SidebarItem} from "../../layout/SimpleSidebar";
import {getRemoteIcon} from "../../../utils/remote";
import EditRemote from "../remote/Edit";
import Header from "../../layout/Header";
import InfoCard from "../../widgets/InfoCard";
import {IDParams} from "./index";

const Remotes: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();

	// global state
	const [listRemotes, {data, loading, error}] = useListRemotes();
	const {id} = useParams<IDParams>();

	useEffect(() => {
		window.document.title = "Remotes";
		void listRemotes({variables: {arch: Archetype.NONE}});
	}, []);

	// local state
	const items: SidebarItem[] = useMemo(() => {
		if (data?.listRemotes == null)
			return [];
		return data.listRemotes.map(r => ({
			label: r.name,
			id: r.id,
			to: `/remote/${r.id}/-/edit`,
			icon: getRemoteIcon(theme, r.archetype)
		}));
	}, [data?.listRemotes]);

	return (
		<SidebarLayout
			sidebarWidth={2}
			sidebar={<SimpleSidebar
				items={items}
				header="Remotes"
				headerTo="/remotes"
				icon={ArrowsRight}
				loading={loading}
			/>}>
			{id ? <EditRemote/> : <Header
				title="Remotes"
				actions={<Button
					variant="contained"
					color="primary"
					component={Link}
					to="/remotes/new">
					New
				</Button>}
				counter={items.length}
			/>}
			{!loading && error != null && <Alert
				severity="error">
				Failed to load remotes.<br/>
				{getGraphErrorMessage(error)}
			</Alert>}
			{!loading && error == null && items.length === 0 && <InfoCard
				title="Remotes"
				icon={ArrowsRight}>
				<Typography
					color="textSecondary">
					A remote is a location that Prism can fetch packages and artifacts from.
					Remotes provide advanced controls over how Prism interacts with them, including transport, firewall and authentication options.
					<br/>
					<br/>
					To get started, <Link to="/remotes/new">create a Remote</Link>
				</Typography>
			</InfoCard>}
		</SidebarLayout>
	);
}
export default Remotes;
