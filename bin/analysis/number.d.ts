import { SchemaExt } from "../types";
export declare function analysisNumber(schema: SchemaExt): AnalysisNumberResult;
export declare type AnalysisNumberResult = {
    min?: number;
    max?: number;
    exMin?: boolean;
    exMax?: boolean;
    pow?: number;
    multipleOf?: number;
    start?: number;
    end?: number;
    re?: number;
};
