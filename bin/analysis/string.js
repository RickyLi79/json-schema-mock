"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisString = void 0;
const types_1 = require("../types");
function analysisString(schema) {
    if (schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.String] === undefined) {
        // console.log(`analysisString`, JSON.stringify(schema).length);
        let { minLength = 0, maxLength, format } = schema;
        maxLength = maxLength;
        //检测 min和max
        if (maxLength !== undefined && minLength > maxLength)
            throw SyntaxError(`string len setting ERROR`);
        const result = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.String] = { minLength, maxLength, format };
        return result;
    }
    return schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.String];
}
exports.analysisString = analysisString;
