import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types";
import { ArrayUtil } from "../utils/ArrayUtil";
import { CombindPrefix } from "./default";

export function analysisArray(schema: SchemaExt): AnalysisArrayResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.Array] === undefined) {
        let min = schema.minItems ?? 0;
        let max = schema.maxItems ?? min + 5;
        //检测 min和max
        if (min > max)
            throw SyntaxError(`Array range setting ERROR`);

        let uniqueItems = schema.uniqueItems ?? false;
        let itemTuple = Array.isArray(schema.items);
        let items = itemTuple ? schema.items as SchemaExt[] : (ArrayUtil.isObjectNotArray(schema.items) ? [<SchemaExt>schema.items] : []);
        let allowAdditional = (itemTuple && ArrayUtil.isObjectNotArray(schema.additionalItems)) ? true : schema.additionalItems !== false;
        let additionalItems = ArrayUtil.isObjectNotArray(schema.additionalItems) ? <SchemaExt>schema.additionalItems : undefined;
        let containsArr: SchemaExt[] = (<any>schema)[`${CombindPrefix}contains`] ?? (schema.contains ? [<SchemaExt>schema.contains!] : []);
        const result = schema[AnalysisMarkName]![AnalysisMarkEnum.Array] = { min, max, uniqueItems, itemTuple, items, allowAdditional, additionalItems, containsArr };
        return result;
    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.Array]!;
}

export type AnalysisArrayResult = {
    min: number;
    max: number;
    uniqueItems: boolean;
    itemTuple: boolean;
    items: SchemaExt[];
    allowAdditional: boolean;
    additionalItems?: SchemaExt;
    containsArr: SchemaExt[];
}