import React, {useEffect, useMemo} from "react";
import {Alert} from "@material-ui/lab";
import {ArrowsSplit} from "tabler-icons-react";
import {useTheme} from "@material-ui/core";
import {useParams} from "react-router";
import useListRefractions from "../../../graph/actions/remote/useListRefractions";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import SidebarLayout from "../../layout/SidebarLayout";
import SimpleSidebar, {SidebarItem} from "../../layout/SimpleSidebar";
import {getRemoteIcon} from "../../../utils/remote";
import EditRefract from "../refract/Edit";
import {IDParams} from "./index";

const Refractions: React.FC = (): JSX.Element => {
	// hooks
	const theme = useTheme();

	// global state
	const {data, loading, error} = useListRefractions();
	const {id} = useParams<IDParams>();

	useEffect(() => {
		window.document.title = "Refractions";
	}, []);

	// local state
	const items: SidebarItem[] = useMemo(() => {
		if (data?.listRefractions == null)
			return [];
		return data.listRefractions.map(r => ({
			label: r.name,
			id: r.id,
			to: `/settings/refract/${r.id}/-/edit`,
			icon: getRemoteIcon(theme, r.archetype)
		}))
	}, [data?.listRefractions]);

	return (
		<SidebarLayout
			sidebarWidth={2}
			sidebar={<SimpleSidebar
				items={items}
				header="Refractions"
				icon={ArrowsSplit}
				loading={loading}
			/>}>
			<div>
				{!loading && error != null && <Alert
					severity="error">
					Failed to load refractions.<br/>
					{getGraphErrorMessage(error)}
				</Alert>}
				{!loading && error == null && items.length === 0 && <Alert
					severity="info">
					No refractions
				</Alert>}
				{id && <EditRefract/>}
			</div>
		</SidebarLayout>
	);
}
export default Refractions;
