import { SchemaExt } from "../types";
export declare function analysisArray(schema: SchemaExt): AnalysisArrayResult;
export declare type AnalysisArrayResult = {
    min: number;
    max: number;
    uniqueItems: boolean;
    itemTuple: boolean;
    items: SchemaExt[];
    allowAdditional: boolean;
    additionalItems?: SchemaExt;
    containsArr: SchemaExt[];
};
