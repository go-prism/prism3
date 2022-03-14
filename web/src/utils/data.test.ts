import {ValidatedData} from "jmp-coreui";
import {DataIsValid} from "./data";

describe("DataIsValid", () => {
	it("empty data is invalid", () => {
		const data: ValidatedData = {
			value: "",
			error: "",
			regex: new RegExp(/.*/)
		}
		expect(DataIsValid(data)).toBeFalsy();
	});
	it("errored data is invalid", () => {
		const data: ValidatedData = {
			value: "test",
			error: "totally invalid",
			regex: new RegExp(/.*/)
		}
		expect(DataIsValid(data)).toBeFalsy();
	});
	it("valid data is valid", () => {
		const data: ValidatedData = {
			value: "test",
			error: "",
			regex: new RegExp(/.*/)
		}
		expect(DataIsValid(data)).toBeTruthy();
	});
});
