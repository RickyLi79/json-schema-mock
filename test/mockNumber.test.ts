import { NodeTestStore } from "./NodeTestStore";

const title = "mock `number`";
const testNode = "num"
NodeTestStore.ltEach(title, `#/properties/${testNode}/properties`);