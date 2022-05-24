/*
 *    Copyright 2022 Django Cass
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
import {useParams} from "react-router";
import {Box, Breadcrumbs, CircularProgress, Link as MuiLink} from "@mui/material";
import {Link} from "react-router-dom";
import Documentation from "../../components/Documentation";
import StandardLayout from "../layout/StandardLayout";
import Error from "../alert/Error";

interface Params {
	path: string;
}

const Help: React.FC = (): JSX.Element => {
	const {path} = useParams<Params>();
	const [data, setData] = useState<string>("");
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setError(() => null);
		setLoading(() => true);
		import(`../../docs/${path}.md?raw`)
			.then(v => setData(() => v?.default || ""))
			.catch(err => setError(() => err))
			.finally(() => setLoading(() => false));
	}, [path]);

	return (
		<StandardLayout
			size="small">
			<Box sx={{m: 2, mt: 4}}>
				<Breadcrumbs>
					<MuiLink
						component={Link}
						to="/help/overview">
						Help
					</MuiLink>
				</Breadcrumbs>
				<Box
					sx={{mt: 1}}>
					{loading && <CircularProgress/>}
					{!loading && error && <Error props={{error: error, resetErrorBoundary: () => {}}}/>}
					{!loading && <Documentation
						text={data}
					/>}
				</Box>
			</Box>
		</StandardLayout>
	);
}
export default Help;