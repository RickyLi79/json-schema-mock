import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types"

export function analysisNumber(schema: SchemaExt): AnalysisNumberResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.Number] === undefined) {
        // console.log(`analysisNumber`, JSON.stringify(schema).length);

        let min = Math.max(schema.minimum ?? Number.MIN_SAFE_INTEGER, <number | undefined>schema.exclusiveMinimum ?? Number.MIN_SAFE_INTEGER);
        let exMin = min === schema.exclusiveMinimum;
        let max = Math.min(schema.maximum ?? Number.MAX_SAFE_INTEGER, <number | undefined>schema.exclusiveMaximum ?? Number.MAX_SAFE_INTEGER);
        let exMax = min === schema.exclusiveMaximum;
        //检测 min和max
        if (min > max || (min == max && (exMin || exMax)))
            throw SyntaxError(`number range setting ERROR`)

        let re: number | undefined = undefined;
        let pow = 1;
        let multipleOf: number | undefined = undefined;
        let start: number | undefined = undefined;
        let end: number | undefined = undefined;
        if (schema.multipleOf !== undefined) {
            //有`multipleOf`的情况
            let len = 0;
            multipleOf = schema.multipleOf;
            start = min == Number.MIN_SAFE_INTEGER ? min : Math.ceil(min / schema.multipleOf) * schema.multipleOf;//最大的范围起始数
            if (start !== Number.MIN_SAFE_INTEGER && start === min && exMin)
                start += schema.multipleOf;
            end = max == Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Math.floor(max / schema.multipleOf) * schema.multipleOf;//最大的范围结束数

            if (end === max && exMax)
                end -= multipleOf;
            if (start > end) {
                throw SyntaxError(`number range setting ERROR`)
            }

            if (start === end && !exMin && !exMax) {
                if (start % multipleOf !== 0)
                    throw SyntaxError(`number range && multipleOf setting conflict`)
                re = start;
                const result = schema[AnalysisMarkName]![AnalysisMarkEnum.Number] = { re }
                return result
            }


            if (!Number.isInteger(multipleOf)) {
                //浮点运算要处理精度问题。 
                len = multipleOf.toString().split('.')[1].length;
                pow = Math.pow(10, len);
                multipleOf *= pow;
                if (start !== Number.MIN_SAFE_INTEGER)
                    start *= pow;
                if (end !== Number.MAX_SAFE_INTEGER)
                    end *= pow;
            }
        }
        else {
            //没有`multipleOf`的情况

            if (min === max && !exMin && !exMax) {
                re = min;
                const result = schema[AnalysisMarkName]![AnalysisMarkEnum.Number] = { re }
                return result
            }

        }

        const result = schema[AnalysisMarkName]![AnalysisMarkEnum.Number] = { min, max, exMin, exMax, pow, multipleOf, start, end }
        return result
    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.Number]!
}

export type AnalysisNumberResult = {
    min?: number;
    max?: number;
    exMin?: boolean;
    exMax?: boolean;
    pow?: number;
    multipleOf?: number;
    start?: number;
    end?: number;
    re?: number;
}