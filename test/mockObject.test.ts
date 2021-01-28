import { NodeTestStore } from "./NodeTestStore";

const title = "mock `object`";
const testNode = "object"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);