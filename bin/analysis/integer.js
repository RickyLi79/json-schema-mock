"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisInteger = void 0;
const types_1 = require("../types");
function analysisInteger(schema) {
    var _a, _b;
    if (schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Integer] === undefined) {
        let min = Math.max((_a = schema.minimum) !== null && _a !== void 0 ? _a : Number.MIN_SAFE_INTEGER, schema.exclusiveMinimum ? schema.exclusiveMinimum + 1 : Number.MIN_SAFE_INTEGER);
        let max = Math.min((_b = schema.maximum) !== null && _b !== void 0 ? _b : Number.MAX_SAFE_INTEGER, schema.exclusiveMaximum ? schema.exclusiveMaximum - 1 : Number.MAX_SAFE_INTEGER);
        //检测 min和max
        if (min > max)
            throw SyntaxError(`integer range setting ERROR`);
        const result = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Integer] = { min, max };
        return result;
    }
    return schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Integer];
}
exports.analysisInteger = analysisInteger;
