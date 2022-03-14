import renderer from "react-test-renderer";
import React from "react";
import NotFound from "./NotFound";

it("renders correctly", () => {
	const tree = renderer.create(<NotFound/>).toJSON();
	expect(tree).toMatchSnapshot();
});