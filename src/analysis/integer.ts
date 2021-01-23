import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types"

export function analysisInteger(schema: SchemaExt): AnalysisIntegerResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.Integer] === undefined) {
        let min = Math.max(schema.minimum ?? Number.MIN_SAFE_INTEGER, <number | undefined>schema.exclusiveMinimum ? <number>schema.exclusiveMinimum + 1 : Number.MIN_SAFE_INTEGER)
        let max = Math.min(schema.maximum ?? Number.MAX_SAFE_INTEGER, <number | undefined>schema.exclusiveMaximum ? <number>schema.exclusiveMaximum - 1 : Number.MAX_SAFE_INTEGER)

        //检测 min和max
        if (min > max)
            throw SyntaxError(`integer range setting ERROR`);

        const result = schema[AnalysisMarkName]![AnalysisMarkEnum.Integer] = { min, max };
        return result;
    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.Integer]!;
}

export type AnalysisIntegerResult = {
    min: number;
    max: number;
}