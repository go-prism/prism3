import {PaletteOptions} from "@mui/material/styles";
import {alpha} from "@mui/material";

export const light: PaletteOptions = {
	primary: {
		main: "#007FFF",
		light: "#66B2FF",
		dark: "#0059B2"
	},
	secondary: {
		main: "#9c27b0",
		light: "#ba68c8",
		dark: "#7b1fa2"
	},
	warning: {
		main: "#F1A204",
		light: "#FFE4A3",
		dark: "#F1A204"
	},
	error: {
		main: "#EB0014",
		light: "#FF99A2",
		dark: "#C70011"
	},
	info: {
		main: "#0288d1",
		light: "#03a9f4",
		dark: "#01579b"
	},
	success: {
		main: "#1AA251",
		light: "#6AE79C",
		dark: "#1AA251"
	},
	background: {
		paper: "#FFFFFF",
		default: "#FAFAFA"
	},
	text: {
		primary: "#202124",
		secondary: "#5f6368"
	},
	mode: "light"
};

export const dark: PaletteOptions = {
	primary: {
		main: "#3399FF",
		light: "#66B2FF",
		dark: "#0059B2"
	},
	secondary: {
		main: "#ce93d8",
		light: "#f3e5f5",
		dark: "#ab47bc"
	},
	warning: {
		main: "#F1A204",
		light: "#FFE4A3",
		dark: "#F1A204"
	},
	error: {
		main: "#EB0014",
		light: "#FF99A2",
		dark: "#C70011"
	},
	info: {
		main: "#29b6f6",
		light: "#4fc3f7",
		dark: "#0288d1"
	},
	success: {
		main: "#1DB45A",
		light: "#6AE79C",
		dark: "#1AA251"
	},
	background: {
		paper: "#0A1929",
		default: "#001E3C"
	},
	action: {
		selected: alpha("#3399FF", 0.16),
		hover: alpha("#3399FF", 0.08)
	},
	mode: "dark"
};
