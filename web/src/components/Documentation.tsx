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

import Markdown from "markdown-to-jsx";
import React from "react";
import {Theme, Typography, Link as MuiLink, TableRow, TableHead, TableCell, Table} from "@mui/material";
import {Link} from "react-router-dom";
import {makeStyles} from "tss-react/mui";
import {Code} from "jmp-coreui";
import {ExternalLink} from "tabler-icons-react";
import Flexbox from "../containers/widgets/Flexbox";

const useStyles = makeStyles()((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 30
	},
	headings: {
		color: theme.palette.text.primary,
		opacity: 0.9
	}
}));

interface Props {
	text: string;
}

interface LinkProps {
	href: string;
}

const Documentation: React.FC<Props> = ({text}): JSX.Element => {
	const {classes} = useStyles();

	const LinkWrapper: React.FC<LinkProps> = ({href, children}): JSX.Element => {
		// filter out external links
		if (href.startsWith("https://")) {
			return <MuiLink
				target="_blank"
				rel="noreferrer noopener"
				href={href}>
				<Flexbox>
					{children}
					<ExternalLink
						style={{marginLeft: 4}}
						size={20}
					/>
				</Flexbox>
			</MuiLink>
		}
		return <MuiLink
			component={Link}
			to={href}>
			{children}
		</MuiLink>
	}

	return <Markdown
		options={{
			overrides: {
				h1: {
					component: Typography,
					props: {
						variant: "h1",
						className: classes.title
					}
				},
				h2: {
					props: {
						className: classes.headings
					}
				},
				h3: {
					props: {
						className: classes.headings
					}
				},
				h4: {
					props: {
						className: classes.headings
					}
				},
				a: {
					component: LinkWrapper
				},
				code: {
					component: Code
				},
				tr: {
					component: TableRow
				},
				td: {
					component: TableCell
				}
			}
		}}>
		{text}
	</Markdown>
}
export default Documentation;
