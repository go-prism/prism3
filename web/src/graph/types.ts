export enum Archetype {
	GENERIC = "GENERIC",
	MAVEN = "MAVEN",
	GO = "GO",
	NPM = "NPM",
	ALPINE = "ALPINE",
	HELM = "HELM",
	RUST = "RUST",
	NONE = ""
}

export interface TransportSecurity {
	id: string;
	ca: string;
	cert: string;
	key: string;
	skipTLSVerify: boolean;
	httpProxy: string;
	httpsProxy: string;
	noProxy: string;
}

export interface RemoteSecurity {
	id: string;
	allowed: string[];
	blocked: string[];
	authHeaders: string[];
}

export interface Remote {
	id: string;
	createdAt: number;
	updatedAt: number;
	name: string;
	uri: string;
	archetype: Archetype;
	enabled: boolean;
	security: RemoteSecurity;
	transport: TransportSecurity;
}

export interface Refraction {
	id: string;
	createdAt: number;
	updatedAt: number;
	name: string;
	archetype: Archetype;
	remotes: Remote[];
}