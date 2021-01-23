import { Random } from "mockjs";
import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types"


export const RandomTypeArr = [() => Random.string(), () => Random.boolean(), () => Random.integer(), () => Random.float(), () => Random.datetime()];
export function analysisObject(schema: SchemaExt): AnalysisObjectResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.Object] === undefined) {
        {
            let min = schema.minProperties ?? 0;
            let max = schema.maxProperties ?? min + 10;
            let required = schema.required ?? [];
            let requiredLen = required.length;
            min = Math.max(min, requiredLen);
            if (max < min) {
                throw SyntaxError(`size range setting ERROR`)
            }

            if (schema.properties !== undefined && Object.keys(schema.properties).length === 0)
            {
                delete schema.properties;
            }

            if (schema.propertyNames !== undefined
                && Object.keys(schema.propertyNames).filter( (name)=>{ return [`enum`,`pattern`].includes(name)} ).length === 0
            ) {
                delete schema.propertyNames;
            }

            if (
                schema.properties === undefined
                && schema.patternProperties === undefined
                && (schema.propertyNames === undefined || schema.propertyNames === true)
                && typeof schema.additionalProperties !== 'object'
            ) {
                const maxCounter = Random.integer(min, max);
                for (let counter = 1; counter <= maxCounter; counter++) {
                    const key = required[counter - 1] ?? (Random.string(1, 4) + counter);
                    const value = Random.pick(arr)()
                    obj[key] = value;
                }
                // console.log(maxCounter, JSON.stringify(obj))
            } else if (1) {

            }
            result = obj;
        }

        schema[AnalysisMarkName]![AnalysisMarkEnum.Object] = { min, max }
    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.Object]!
}

export type AnalysisObjectResult = {
    min: number;
    max: number;
}