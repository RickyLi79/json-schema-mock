import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const schema = await NodeTestStore.getTestSchema();
    describe("mockNode object", async () => {
        let repeat: number = 100;
        let node: { [name: string]: SchemaExt } = schema.properties?.object.properties!
        NodeTestStore.ltEach(node, { repeat });
    });
}

start()