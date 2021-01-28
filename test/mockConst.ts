import { SchemaExt } from "../lib/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const ms = await NodeTestStore.getSchemaMock();
    describe("mock `const`", async () => {
        let node: { [name: string]: SchemaExt } = ms.schema.properties?.const.properties!
        NodeTestStore.ltEach(node);
    });
}

start()