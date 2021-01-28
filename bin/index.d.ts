import { SchemaExt } from "./types";
export declare class SchemaMock {
    protected static _instances: {
        [name: string]: SchemaMock;
    };
    protected readonly _orgSchema: SchemaExt;
    /**
     * the orgin schema from `#parser`
     * @see #parser
     */
    get schema(): SchemaExt;
    get analysisSchema(): SchemaExt;
    protected _analysisSchema: SchemaExt;
    protected constructor(schema: SchemaExt);
    /**
     * get one mock data
     * @param jspath like : "#/a/b/0/d". MUST startWith "#/"
     */
    mock(jspath?: string | Partial<MockOptions>): any;
    protected static mock(orgSchema: SchemaExt, options?: Partial<MockOptions>): any;
    /**
     * to create SchemaMock
     * @param schema
     */
    static parser(schema: string | SchemaExt): Promise<SchemaMock>;
}
export declare type MockOptions = {
    /**
     * like : "#/a/b/0/c"
     */
    jspath?: string;
    /**
     * the given attributes will not be mock
     */
    skipMockAtts: string[];
    /**
     * if `true`, `object` data will only mock propertis in `required`
     */
    requiredOnly: boolean;
};
export declare type Schema = SchemaExt;
