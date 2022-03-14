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
import {
	Collapse,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	makeStyles,
	Switch,
	TextField,
	Theme
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {UpdateProfileRequest} from "@prism/prism-rpc/build/gen/service/api/remote_pb";

const useStyles = makeStyles((theme: Theme) => ({
	text: {
		margin: theme.spacing(1)
	},
	input: {
		fontFamily: "monospace",
		fontSize: 14
	}
}));

export const CLIENT_PROFILE_DEFAULT: UpdateProfileRequest.AsObject = {
	ca: "",
	cert: "",
	key: "",
	skiptls: false,
	httpproxy: "",
	httpsproxy: "",
	noproxy: ""
};

interface ClientConfigProps {
	profile: UpdateProfileRequest.AsObject;
	setProfile: (p: UpdateProfileRequest.AsObject) => void;
	loading?: boolean;
	disabled?: boolean;
}

const ClientConfig: React.FC<ClientConfigProps> = ({profile, setProfile, loading, disabled}): JSX.Element => {
	// hooks
	const classes = useStyles();

	// local state
	const [skipTLS, setSkipTLS] = useState<boolean>(profile.skiptls);
	const [ca, setCA] = useState<string>(profile.ca);
	const [cert, setCert] = useState<string>(profile.cert);
	const [key, setKey] = useState<string>(profile.key);

	const [httpProxy, setHttpProxy] = useState<string>(profile.httpproxy);
	const [httpsProxy, setHttpsProxy] = useState<string>(profile.httpsproxy);
	const [noProxy, setNoProxy] = useState<string>(profile.noproxy);

	const defaultProps = {
		className: classes.text,
		multiline: true,
		fullWidth: true,
		disabled: loading,
		InputProps: {classes: {input: classes.input}}
	};

	useEffect(() => {
		setHttpProxy(profile.httpproxy);
		setHttpsProxy(profile.httpsproxy);
		setNoProxy(profile.noproxy);
		setSkipTLS(profile.skiptls);
		setCA(profile.ca);
		setCert(profile.cert);
		setKey(profile.key);
	}, [profile]);

	useEffect(() => {
		const p = profile;
		p.ca = ca;
		p.cert = cert;
		p.key = key;
		p.skiptls = skipTLS;
		p.httpproxy = httpProxy;
		p.httpsproxy = httpsProxy;
		p.noproxy = noProxy;
		setProfile(p);
	}, [skipTLS, ca, cert, key, httpProxy, httpsProxy, noProxy]);

	return (
		<div>
			<ListSubheader>Certificate authorities</ListSubheader>
			<TextField
				{...defaultProps}
				id="textfield-ca"
				variant="outlined"
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
				label="Key"
				placeholder="Enter a decrypted key..."
				value={key}
				disabled={loading || disabled}
				onChange={e => setKey(e.target.value)}
			/>
			<Collapse
				in={skipTLS}>
				<Alert
					severity="warning">
					Skipping TLS verification undermines the basic principles that define
					Public Key Infrastructure and opens you up to security vulnerabilities
					such as MitM attacks.
				</Alert>
			</Collapse>
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
			<ListSubheader>HTTP Proxy</ListSubheader>
			<TextField
				{...defaultProps}
				id="textfield-http-proxy"
				variant="outlined"
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
