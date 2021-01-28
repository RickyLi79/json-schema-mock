import { SchemaExt } from "../types";
export declare function analysisString(schema: SchemaExt): AnalysisStringResult;
export declare type AnalysisStringResult = {
    minLength: number;
    maxLength?: number;
    format?: string;
};
