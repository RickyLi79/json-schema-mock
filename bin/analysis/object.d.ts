import { SchemaExt } from "../types";
export declare const RandomTypeArr: ((() => {}) | (() => null))[];
export declare const TypesToRandom: string[];
export declare function analysisObject(schema: SchemaExt): AnalysisObjectResult;
export declare type AnalysisObjectResult = {
    min: number;
    max?: number;
    required: string[];
    requiredLen: number;
    allowAdditional: boolean;
    allowKeys: string[];
    keyPatterns: string[];
    allowPattern: boolean;
    depkeys: {
        [key: string]: string[];
    };
    depSchemas: {
        [key: string]: SchemaExt;
    };
};
