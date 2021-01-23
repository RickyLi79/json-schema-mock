import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {
    const schema = await NodeTestStore.getTestSchema();
    describe("mockNode integer", async () => {
        let repeat: number = 1000;
        let node: { [name: string]: SchemaExt } = schema.properties?.int.properties!
        NodeTestStore.ltEach(node, { repeat });
    });
}

start()