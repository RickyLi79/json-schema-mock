import { NodeTestStore } from "./NodeTestStore";

const title = "mock `integer`";
const testNode = "int"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);