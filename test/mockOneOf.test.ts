import { NodeTestStore } from "./NodeTestStore";

const title = "mock `oneOf`";
const testNode = "OneOf"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);