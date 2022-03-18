import renderer from "react-test-renderer";
import {createMuiTheme} from "@material-ui/core";
import React from "react";
import {Archetype} from "../graph/types";
import {getRemoteIcon} from "./remote";

describe("getRemoteIcon", () => {
	it("renders maven correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, Archetype.MAVEN)}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("renders node correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, Archetype.NPM)}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("renders alpine correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, Archetype.ALPINE)}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it("renders generic correctly", () => {
		const theme = createMuiTheme();
		const tree = renderer.create(<div>
			{getRemoteIcon(theme, Archetype.NONE)}
		</div>).toJSON();
		expect(tree).toMatchSnapshot();
	});
})