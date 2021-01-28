import { NodeTestStore } from "./NodeTestStore";

const title = "mock `allOf`";
const testNode = "AllOf"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);