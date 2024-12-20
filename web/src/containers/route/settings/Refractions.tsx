import React, {useEffect, useMemo} from "react";
import {Alert, Button, Typography, useTheme} from "@mui/material";
import {ArrowsSplit} from "tabler-icons-react";
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import SidebarLayout from "../../layout/SidebarLayout";
import SimpleSidebar, {SidebarItem} from "../../layout/SimpleSidebar";
import {getRemoteIcon} from "../../../utils/remote";
import EditRefract from "../refract/Edit";
import Header from "../../layout/Header";
import InfoCard from "../../widgets/InfoCard";
import {useListRefractionsQuery} from "../../../generated/graphql";
import {IDParams} from "./index";

const Refractions: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();

	// global state
	const {data, loading, error, refetch} = useListRefractionsQuery();
	const {id} = useParams<IDParams>();

	useEffect(() => {
		window.document.title = "Refractions";
	}, []);

	useEffect(() => {
		void refetch();
	}, [id]);

	// local state
	const items: SidebarItem[] = useMemo(() => {
		if (data?.listRefractions == null)
			return [];
		return data.listRefractions.map(r => ({
			label: r.name,
			id: r.id,
			to: `/refract/${r.id}/-/edit`,
			icon: getRemoteIcon(theme, r.archetype)
		}))
	}, [data?.listRefractions]);

	return (
		<SidebarLayout
			sidebarWidth={2}
			sidebar={<SimpleSidebar
				items={items}
				header="Refractions"
				headerTo="/refract"
				colour={theme.palette.info.main}
				icon={ArrowsSplit}
				loading={loading}
			/>}>
			<div>
				{id ? <EditRefract/> : <Header
					title="Refractions"
					actions={<Button
						variant="contained"
						color="primary"
						component={Link}
						to="/refract/new">
						New
					</Button>}
					counter={items.length}
				/>}
				{!loading && error != null && <Alert
					severity="error">
					Failed to load refractions.<br/>
					{getGraphErrorMessage(error)}
				</Alert>}
				{!loading && error == null && !id && <InfoCard
					title="Refractions"
					colour={theme.palette.info.main}
					icon={ArrowsSplit}>
					<Typography
						color="textSecondary">
						A refraction is an abstraction that allows you to retrieve artifacts and packages from a collection of <Link to="/remotes">Remotes</Link>, as if they were one.
						Refractions respect the individual configurations of a remote.
						<br/>
						Refractions can only contain remotes of a single archetype (e.g. Maven or NPM).
						<br/>
						<br/>
						To get started, <Link to="/refract/new">create a Refraction</Link>
					</Typography>
				</InfoCard>}
			</div>
		</SidebarLayout>
	);
}
export default Refractions;
