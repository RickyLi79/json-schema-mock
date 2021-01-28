import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const ms = await NodeTestStore.getSchemaMock();
    describe("mock `array`", async () => {
        let node: { [name: string]: SchemaExt } = ms.schema.properties?.array.properties!
        NodeTestStore.ltEach(node);
    });
}

start()