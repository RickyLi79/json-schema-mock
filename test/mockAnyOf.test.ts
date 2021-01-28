import { NodeTestStore } from "./NodeTestStore";

const title = "mock `anyOf`";
const testNode = "AnyOf"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);