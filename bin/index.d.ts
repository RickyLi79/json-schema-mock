import { SchemaExt } from "./types";
export declare class SchemaMock {
    protected static _instances: {
        [name: string]: SchemaMock;
    };
    protected readonly _orgSchema: SchemaExt;
    get schema(): SchemaExt;
    get analysisSchema(): SchemaExt;
    protected _analysisSchema: SchemaExt;
    protected constructor(orgSchema: SchemaExt);
    static mockNode(orgSchema: SchemaExt, options?: Partial<MockOptions>): any;
    static parser(file: string): Promise<SchemaMock>;
}
export declare type MockOptions = {
    skipMockAtts: string[];
    requiredOnly: boolean;
};
