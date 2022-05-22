import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";

export default defineConfig({
	build: {
		outDir: "build"
	},
	server: {
		https: false,
		host: true,
		port: 3000,
		hmr: {
			protocol: "wss",
			clientPort: 443
		}
	},
	plugins: [
		react(),
		svgrPlugin({
			svgrOptions: {
				icon: true
			}
		})
	]
});
