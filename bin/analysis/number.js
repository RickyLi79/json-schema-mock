"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisNumber = void 0;
const types_1 = require("../types");
function analysisNumber(schema) {
    var _a, _b, _c, _d;
    if (schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Number] === undefined) {
        // console.log(`analysisNumber`, JSON.stringify(schema).length);
        let min = Math.max((_a = schema.minimum) !== null && _a !== void 0 ? _a : Number.MIN_SAFE_INTEGER, (_b = schema.exclusiveMinimum) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER);
        let exMin = min === schema.exclusiveMinimum;
        let max = Math.min((_c = schema.maximum) !== null && _c !== void 0 ? _c : Number.MAX_SAFE_INTEGER, (_d = schema.exclusiveMaximum) !== null && _d !== void 0 ? _d : Number.MAX_SAFE_INTEGER);
        let exMax = min === schema.exclusiveMaximum;
        //检测 min和max
        if (min > max || (min == max && (exMin || exMax)))
            throw SyntaxError(`number range setting ERROR`);
        let re = undefined;
        let pow = 1;
        let multipleOf = undefined;
        let start = undefined;
        let end = undefined;
        if (schema.multipleOf !== undefined) {
            //有`multipleOf`的情况
            let len = 0;
            multipleOf = schema.multipleOf;
            start = min == Number.MIN_SAFE_INTEGER ? min : Math.ceil(min / schema.multipleOf) * schema.multipleOf; //最大的范围起始数
            if (start !== Number.MIN_SAFE_INTEGER && start === min && exMin)
                start += schema.multipleOf;
            end = max == Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Math.floor(max / schema.multipleOf) * schema.multipleOf; //最大的范围结束数
            if (end === max && exMax)
                end -= multipleOf;
            if (start > end) {
                throw SyntaxError(`number range setting ERROR`);
            }
            if (start === end && !exMin && !exMax) {
                if (start % multipleOf !== 0)
                    throw SyntaxError(`number range && multipleOf setting conflict`);
                re = start;
                const result = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Number] = { re };
                return result;
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
                const result = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Number] = { re };
                return result;
            }
        }
        const result = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Number] = { min, max, exMin, exMax, pow, multipleOf, start, end };
        return result;
    }
    return schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Number];
}
exports.analysisNumber = analysisNumber;
