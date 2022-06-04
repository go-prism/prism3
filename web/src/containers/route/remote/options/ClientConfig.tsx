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
import {
	Alert,
	Collapse,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Switch,
	TextField,
	Theme,
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {TransportSecurity} from "../../../../generated/graphql";

const useStyles = makeStyles()((theme: Theme) => ({
	text: {
		margin: theme.spacing(1)
	},
	input: {
		fontFamily: "monospace",
		fontSize: 14
	}
}));

interface ClientConfigProps {
	profile: TransportSecurity;
	setProfile: (p: TransportSecurity) => void;
	loading?: boolean;
	disabled?: boolean;
}

const ClientConfig: React.FC<ClientConfigProps> = ({profile, setProfile, loading, disabled}): JSX.Element => {
	// hooks
	const {classes} = useStyles();

	// local state
	const [skipTLS, setSkipTLS] = useState<boolean>(profile.skipTLSVerify);
	const [ca, setCA] = useState<string>(profile.ca);
	const [cert, setCert] = useState<string>(profile.cert);
	const [key, setKey] = useState<string>(profile.key);

	const [httpProxy, setHttpProxy] = useState<string>(profile.httpProxy);
	const [httpsProxy, setHttpsProxy] = useState<string>(profile.httpsProxy);
	const [noProxy, setNoProxy] = useState<string>(profile.noProxy);

	const defaultProps = {
		className: classes.text,
		multiline: true,
		fullWidth: true,
		disabled: loading,
		InputProps: {classes: {input: classes.input}}
	};

	useEffect(() => {
		setHttpProxy(profile.httpProxy);
		setHttpsProxy(profile.httpsProxy);
		setNoProxy(profile.noProxy);
		setSkipTLS(profile.skipTLSVerify);
		setCA(profile.ca);
		setCert(profile.cert);
		setKey(profile.key);
	}, [profile]);

	useEffect(() => {
		const p = JSON.parse(JSON.stringify(profile));
		p.ca = ca;
		p.cert = cert;
		p.key = key;
		p.skipTLSVerify = skipTLS;
		p.httpProxy = httpProxy;
		p.httpsProxy = httpsProxy;
		p.noProxy = noProxy;
		setProfile(p);
	}, [skipTLS, ca, cert, key, httpProxy, httpsProxy, noProxy]);

	return (
		<div>
			<ListSubheader>Certificate authorities</ListSubheader>
			<TextField
				{...defaultProps}
				id="textfield-ca"
				variant="outlined"
				size="small"
				minRows={5}
				placeholder="Enter one or more pem-encoded certificates..."
				value={ca}
				disabled={loading || disabled}
				onChange={e => setCA(e.target.value)}
			/>
			<ListSubheader>Client certificates</ListSubheader>
			<TextField
				{...defaultProps}
				id="textfield-cert"
				variant="outlined"
				size="small"
				minRows={5}
				label="Certificate"
				placeholder="Enter a pem-encoded certificate..."
				value={cert}
				disabled={loading || disabled}
				onChange={e => setCert(e.target.value)}
			/>
			<TextField
				{...defaultProps}
				id="textfield-key"
				variant="outlined"
				size="small"
				minRows={5}
				label="Key"
				placeholder="Enter a decrypted key..."
				value={key}
				disabled={loading || disabled}
				onChange={e => setKey(e.target.value)}
			/>
			<ListItem>
				<ListItemIcon>
					<Switch
						color="primary"
						checked={skipTLS}
						onChange={(_, checked) => setSkipTLS(checked)}
						disabled={loading || disabled}
					/>
				</ListItemIcon>
				<ListItemText
					primary="Skip TLS verification"
					secondary="Prism will not verify the authenticity of remote certificates (not recommended)."
				/>
			</ListItem>
			<Collapse
				in={skipTLS}>
				<Alert
					severity="warning">
					Skipping TLS verification undermines the basic principles that define
					Public Key Infrastructure and opens you up to security vulnerabilities
					such as MitM attacks.
				</Alert>
			</Collapse>
			<ListSubheader>HTTP Proxy</ListSubheader>
			<TextField
				{...defaultProps}
				id="textfield-http-proxy"
				variant="outlined"
				size="small"
				label="HTTP Proxy URL"
				placeholder="Enter a URL..."
				value={httpProxy}
				disabled={loading || disabled}
				onChange={e => setHttpProxy(e.target.value)}
			/>
			<TextField
				{...defaultProps}
				id="textfield-https-proxy"
				variant="outlined"
				size="small"
				label="HTTPS Proxy URL"
				placeholder="Enter a URL..."
				value={httpsProxy}
				disabled={loading || disabled}
				onChange={e => setHttpsProxy(e.target.value)}
			/>
			<TextField
				{...defaultProps}
				id="textfield-no-proxy"
				variant="outlined"
				size="small"
				label="No Proxy"
				placeholder="Enter a comma separated list of host names..."
				value={noProxy}
				disabled={loading || disabled}
				onChange={e => setNoProxy(e.target.value)}
			/>
		</div>
	);
}
export default ClientConfig;
