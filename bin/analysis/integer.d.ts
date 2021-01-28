import { SchemaExt } from "../types";
export declare function analysisInteger(schema: SchemaExt): AnalysisIntegerResult;
export declare type AnalysisIntegerResult = {
    min: number;
    max: number;
};
