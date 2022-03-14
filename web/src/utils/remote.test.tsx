import renderer from "react-test-renderer";
import {createMuiTheme} from "@material-ui/core";
import React from "react";
import {getRemoteIcon} from "./remote";

describe("getRemoteIcon", () => {
	it("renders maven correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, "maven")}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("renders node correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, "node")}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("renders alpine correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, "alpine")}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("renders generic correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, "")}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
})