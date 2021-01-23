import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types"

export function analysisString(schema: SchemaExt): AnalysisStringResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.String] === undefined) {
        // console.log(`analysisString`, JSON.stringify(schema).length);

        let { minLength = 0, maxLength, format } = schema;
        maxLength = maxLength ?? minLength + 10;

        //检测 min和max
        if (minLength<0 || minLength > maxLength)
            throw SyntaxError(`string len setting ERROR`)

        const result = schema[AnalysisMarkName]![AnalysisMarkEnum.String] = { minLength, maxLength, format }
        return result
    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.String]!
}

export type AnalysisStringResult = {
    minLength: number;
    maxLength: number;
    format?: string
}