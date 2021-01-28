import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const ms = await NodeTestStore.getSchemaMock();
    describe("mock `allOf`", async () => {
        let node: { [name: string]: SchemaExt } = ms.schema.properties?.AllOf.properties!
        NodeTestStore.ltEach(node);
    });
}

start()