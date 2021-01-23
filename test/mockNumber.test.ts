import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const schema = await NodeTestStore.getTestSchema();
    describe("mockNode number", async () => {
        let repeat: number = 1000;
        let node: { [name: string]: SchemaExt } = schema.properties?.num.properties!
        NodeTestStore.ltEach(node, { repeat });
    });
}

start()