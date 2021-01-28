import { NodeTestStore } from "./NodeTestStore";

const title = "mock `string`";
const testNode = "str"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);