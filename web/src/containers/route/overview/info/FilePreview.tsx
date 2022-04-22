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
import {Alert} from "@mui/material";
import {ListItemSkeleton} from "jmp-coreui";
import getErrorMessage from "../../../../selectors/getErrorMessage";
import {API_URL} from "../../../../config";
import CodeBlock from "../../../widgets/CodeBlock";

interface FilePreviewProps {
	refraction: string;
	uri: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({refraction, uri}): JSX.Element => {
	// global state
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);
	const [data, setData] = useState<string>();

	const getFile = (): void => {
		setLoading(() => true);
		setError(() => null);
		fetch(`${API_URL}/api/v1/${refraction.toLocaleLowerCase()}/-/${uri}`)
			.then(res => {
				if (!res.ok) {
					throw new Error(res.statusText);
				}
				return res.text();
			})
			.then(str => {
				setData(() => str);
			})
			.catch(err => setError(() => err))
			.finally(() => setLoading(() => false));
	}

	useEffect(() => {
		getFile();
	}, [refraction, uri]);

	const codeLang = (): string => {
		switch (true) {
			case uri.endsWith(".pom"):
			case uri.endsWith(".xml"):
				return "xml";
			case uri.endsWith(".mod"):
				return "go";
			case uri.endsWith(".info"):
				return "json";
			default:
				return "text";
		}
	}

	return (
		<div>
			{loading && <div>
				<ListItemSkeleton icon/>
				<ListItemSkeleton invertLengths/>
				<ListItemSkeleton/>
				<ListItemSkeleton invertLengths/>
				<ListItemSkeleton icon/>
				<ListItemSkeleton/>
			</div>}
			{!loading && error != null && <Alert
				severity="error">
				Unable to load file preview.<br/>
				{getErrorMessage(error)}
			</Alert>}
			{!loading && error == null && data && <CodeBlock
				code={data}
				language={codeLang()}
			/>}
		</div>
	);
}
export default FilePreview;
