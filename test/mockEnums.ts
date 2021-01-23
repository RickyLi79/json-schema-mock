import { SchemaExt } from "../src/types";
import { NodeTestStore } from "./NodeTestStore";

async function start() {

    const schema = await NodeTestStore.getTestSchema();
    describe("mockNode enums", async () => {
        let repeat: number = 100;
        let node: { [name: string]: SchemaExt };
        {
            node = schema.properties?.enums.properties!
        }
        NodeTestStore.ltEach(node, { repeat });
    });
}

start()