import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types";

export function analysisString(schema: SchemaExt): AnalysisStringResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.String] === undefined) {
        // console.log(`analysisString`, JSON.stringify(schema).length);

        let { minLength = 0, maxLength, format } = schema;
        maxLength = maxLength;

        //检测 min和max
        if (maxLength !== undefined && minLength > maxLength)
            throw SyntaxError(`string len setting ERROR`)

        const result = schema[AnalysisMarkName]![AnalysisMarkEnum.String] = { minLength, maxLength, format }
        return result
    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.String]!
}

export type AnalysisStringResult = {
    minLength: number;
    maxLength?: number;
    format?: string
}

