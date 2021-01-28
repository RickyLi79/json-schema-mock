import { SchemaExt } from "../types";
export declare function analysisSchema(orgSchema: SchemaExt, clone: boolean, extra?: {
    [key: string]: any;
}): SchemaExt;
export declare function analysisCombining(schema: SchemaExt, level: number, keysToComb?: Set<string>, extra?: {
    [key: string]: any;
}, addMark?: boolean, force?: boolean): void;
export declare const CombindPrefix = "x-combind-";
export declare function analysisAllOf(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark?: boolean, force?: boolean): SchemaExt;
export declare function analysisAnyOf_bak(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark?: boolean, force?: boolean): SchemaExt;
export declare function analysisAnyOf(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark?: boolean, force?: boolean): SchemaExt;
export declare function analysisOneOf(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark?: boolean, force?: boolean): SchemaExt;
