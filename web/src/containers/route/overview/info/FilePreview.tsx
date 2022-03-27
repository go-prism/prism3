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

import React from "react";
import {Alert} from "@mui/material";
import {ListItemSkeleton} from "jmp-coreui";
import useErrors from "../../../../hooks/useErrors";
import getErrorMessage from "../../../../selectors/getErrorMessage";
import useLoading from "../../../../hooks/useLoading";

interface FilePreviewProps {
	refraction: string;
	uri: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({refraction, uri}): JSX.Element => {
	// global state
	const loading = useLoading([]);
	const error = useErrors([]);

	// useEffect(() => {
	// 	getFile(dispatch, refraction, uri);
	// }, [refraction, uri]);

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
				{getErrorMessage(error)}
			</Alert>}
			{/*{!loading && error == null && filePreview != null && <CodeBlock*/}
			{/*	text={filePreview}*/}
			{/*	showLineNumbers*/}
			{/*	language={codeLang()}*/}
			{/*	theme={dracula}*/}
			{/*/>}*/}
		</div>
	);
}
export default FilePreview;
