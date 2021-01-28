"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisArray = void 0;
const types_1 = require("../types");
const ArrayUtil_1 = require("../utils/ArrayUtil");
const default_1 = require("./default");
function analysisArray(schema) {
    var _a, _b, _c, _d;
    if (schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Array] === undefined) {
        let min = (_a = schema.minItems) !== null && _a !== void 0 ? _a : 0;
        let max = (_b = schema.maxItems) !== null && _b !== void 0 ? _b : min + 5;
        //检测 min和max
        if (min > max)
            throw SyntaxError(`Array range setting ERROR`);
        let uniqueItems = (_c = schema.uniqueItems) !== null && _c !== void 0 ? _c : false;
        let itemTuple = Array.isArray(schema.items);
        let items = itemTuple ? schema.items : (ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.items) ? [schema.items] : []);
        let allowAdditional = (itemTuple && ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.additionalItems)) ? true : schema.additionalItems !== false;
        let additionalItems = ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.additionalItems) ? schema.additionalItems : undefined;
        let containsArr = (_d = schema[`${default_1.CombindPrefix}contains`]) !== null && _d !== void 0 ? _d : (schema.contains ? [schema.contains] : []);
        const result = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Array] = { min, max, uniqueItems, itemTuple, items, allowAdditional, additionalItems, containsArr };
        return result;
    }
    return schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Array];
}
exports.analysisArray = analysisArray;
