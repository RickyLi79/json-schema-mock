import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const ms = await NodeTestStore.getSchemaMock();
    describe("mock `object`", async () => {
        let node: { [name: string]: SchemaExt } = ms.schema.properties?.object.properties!
        NodeTestStore.ltEach(node);
    });
}

start()