import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const schema = await NodeTestStore.getTestSchema();
    describe("mockNode const", async () => {
        let repeat: number = 100;
        let node: { [name: string]: SchemaExt };
        {
            node = schema.properties?.const.properties!
        }
        NodeTestStore.ltEach(node, { repeat });
    });
}

start()