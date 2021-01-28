import { NodeTestStore } from "./NodeTestStore";

const title = "mock `const`";
const testNode = "const"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);