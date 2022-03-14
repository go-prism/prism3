interface WindowEnv {
	PRISM_API_URL?: string;
}

declare global {
	interface Window {
		_env_?: WindowEnv;
	}
}

export const API_URL = window._env_?.PRISM_API_URL || "http://localhost:8080";
