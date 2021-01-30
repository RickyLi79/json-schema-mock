"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisOneOf = exports.analysisAnyOf = exports.analysisAnyOf_bak = exports.analysisAllOf = exports.CombindPrefix = exports.analysisCombining = exports.analysisSchema = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mockjs_1 = require("mockjs");
const types_1 = require("../types");
const ArrayUtil_1 = require("../utils/ArrayUtil");
const RegExpUtil_1 = require("../utils/RegExpUtil");
//#region resolve schema
function analysisSchema(orgSchema, clone, extra = {}) {
    var _a;
    let schema = clone ? lodash_1.default.cloneDeep(orgSchema) : orgSchema;
    schema[types_1.AnalysisMarkName] = (_a = schema[types_1.AnalysisMarkName]) !== null && _a !== void 0 ? _a : {};
    const bak = {};
    for (let iKey in extra) {
        bak[iKey] = schema[iKey];
        schema[iKey] = extra[iKey];
    }
    // analysisExamples(schema);
    analysisCombining(schema, 0);
    for (let iKey in extra) {
        if (bak[iKey] === undefined) {
            delete schema[iKey];
        }
        else {
            schema[iKey] = bak[iKey];
        }
    }
    return schema;
}
exports.analysisSchema = analysisSchema;
const CombProperties = new Set(["x-mock-tpl", "type", "const", "enum", "format", "uniqueItems", "required", "pattern", "propertyNames", "properties", "additionalProperties", "multipleOf", "maxLength", "maxItems", "maxProperties", "maximum", "exclusiveMaximum", "minLength", "minItems", "minProperties", "minimum", "exclusiveMinimum", "items", "additionalItems", "contains", "dependencies", "patternProperties"]);
function analysisCombining(schema, level, keysToComb, extra = {}, addMark = true, force = false) {
    var _a, _b;
    if (!ArrayUtil_1.ArrayUtil.isObjectNotArray(schema))
        return;
    schema[types_1.AnalysisMarkName] = (_a = schema[types_1.AnalysisMarkName]) !== null && _a !== void 0 ? _a : {};
    //#region 
    const bak = {};
    for (let iKey in extra) {
        bak[iKey] = schema[iKey];
        schema[iKey] = extra[iKey];
    }
    if (((_b = schema.oneOf) === null || _b === void 0 ? void 0 : _b.length) === 1) {
        if (schema.allOf === undefined) {
            schema.allOf = schema.oneOf;
        }
        else {
            schema.allOf.push(schema.oneOf[0]);
        }
        delete schema.oneOf;
    }
    //#endregion
    analysisAnyOf(schema, level, keysToComb, addMark, force);
    analysisOneOf(schema, level, keysToComb, addMark, force);
    analysisAllOf(schema, level, keysToComb, addMark, force);
    // analysisOneOf(schema, level, keysToComb);
    for (let iKey in extra) {
        if (bak[iKey] === undefined) {
            delete schema[iKey];
        }
        else {
            schema[iKey] = bak[iKey];
        }
    }
}
exports.analysisCombining = analysisCombining;
exports.CombindPrefix = "x-combind-";
function analysisAllOf(schema, level, keysToComb, addMark = true, force = false) {
    var _a, _b;
    if ((force || ((_a = schema[types_1.AnalysisMarkName]) === null || _a === void 0 ? void 0 : _a[types_1.AnalysisMarkEnum.AllOf]) === undefined) && ((_b = schema.allOf) === null || _b === void 0 ? void 0 : _b[0]) !== undefined) {
        lodash_1.default.reduce(schema.allOf, (result, iSchema) => {
            var _a, _b, _c, _d, _e, _f, _g;
            // if (level > 0)
            analysisSchema(iSchema, false);
            for (let iKey in iSchema) {
                if (!CombProperties.has(iKey))
                    continue;
                if (keysToComb !== undefined && !keysToComb.has(iKey))
                    continue;
                const reObj = result[iKey];
                const iObj = iSchema[iKey];
                if (reObj === iObj) {
                    continue;
                }
                const reObjType = typeof reObj;
                const iObjType = typeof iObj;
                if (reObj === undefined) {
                    result[iKey] = iObj;
                    if (iKey === "contains") {
                        result[`${exports.CombindPrefix}contains`] = [iObj];
                    }
                }
                else if (iObj !== undefined) {
                    switch (iKey) {
                        //#region common
                        case "const":
                        case "format":
                        case "uniqueItems":
                            if (reObj !== iObj)
                                throw new SyntaxError(`conflict on \`${iKey}\``);
                            break;
                        case "type":
                        case "enum":
                            {
                                result[iKey] = ArrayUtil_1.ArrayUtil.intersection(Array.isArray(reObj) ? reObj : [reObj], Array.isArray(iObj) ? iObj : [iObj]);
                                if (result[iKey].length === 0) {
                                    throw new SyntaxError(`conflict on \`${iKey}\``);
                                }
                            }
                            break;
                        case "required":
                        case "examples":
                            {
                                result[iKey] = reObj.concat(iObj);
                                delete iSchema[iKey];
                            }
                            break;
                        //#endregion
                        //#region string
                        case "pattern":
                            result[iKey] = RegExpUtil_1.RegExpUtil.getMergedReg(result[iKey], iObj);
                            // result[iKey] += `(.+)?${iObj}`;
                            break;
                        //#endregion
                        //#region object
                        case "propertyNames":
                            if (reObj === false) {
                                break;
                            }
                            else if (reObj === true && iObj === false) {
                                break;
                            }
                            analysisCombining(iObj, level + 1, new Set(['const', 'pattern', 'enum']));
                            if (reObj === undefined) {
                                reObj.const = iObj.const;
                            }
                            else if (reObj.const !== iObj.const) {
                                throw new SyntaxError("conflict with `propertyNames.const`");
                            }
                            if (reObj.pattern === undefined || reObj.pattern === "") {
                                reObj.pattern = iObj.pattern;
                            }
                            else {
                                reObj.pattern = RegExpUtil_1.RegExpUtil.getMergedReg(reObj.pattern, iObj.pattern);
                                // reObj.pattern = (reObj.pattern ?? "") + `(.+)?${iObj.pattern}`;
                            }
                            if (iObj.enum !== undefined) {
                                reObj.enum = reObj.enum ? ArrayUtil_1.ArrayUtil.intersection(reObj.enum, iObj.enum) : iObj.enum;
                            }
                            break;
                        case "patternProperties":
                        case "properties":
                            {
                                for (let jKey in iObj) {
                                    if (reObj[jKey] !== undefined) {
                                        analysisCombining(reObj[jKey], level + 1, undefined, { allOf: [iObj[jKey]] }, false, true);
                                    }
                                    else {
                                        reObj[jKey] = iObj[jKey];
                                    }
                                }
                            }
                            break;
                        case "additionalProperties":
                            {
                                if (reObj === false) {
                                    break;
                                }
                                else if (reObj === true && iObj === false) {
                                    break;
                                }
                                analysisSchema(iObj, false);
                                analysisCombining(reObj, level + 1, undefined, { allOf: [iObj] }, false);
                                (_a = reObj.allOf) === null || _a === void 0 ? true : delete _a.additionalProperties;
                                // for (let jKey in iObj) {
                                //     reObj[jKey] = reObj[jKey] ?? iObj[jKey];
                                // }
                            }
                            break;
                        case "dependencies":
                            {
                                for (let jKey in iObj) {
                                    if (reObj[jKey] === undefined) {
                                        reObj[jKey] = iObj[jKey];
                                    }
                                    else if (Array.isArray(reObj[jKey]) && Array.isArray(iObj[jKey])) {
                                        // both are `array`
                                        reObj[jKey] = ArrayUtil_1.ArrayUtil.unique([reObj[jKey], iObj[jKey]]);
                                    }
                                    else if (ArrayUtil_1.ArrayUtil.isObjectNotArray(reObj[jKey]) && ArrayUtil_1.ArrayUtil.isObjectNotArray(iObj[jKey])) {
                                        // both are `schema`
                                        analysisCombining(reObj[jKey], level + 1, undefined, { allOf: [iObj[jKey]] }, false), true;
                                    }
                                    else {
                                        // one is `array`, the other is `schema`
                                        let tmp = Array.isArray(reObj[jKey]);
                                        let obj = tmp ? iObj[jKey] : reObj[jKey];
                                        let arr = tmp ? reObj[jKey] : iObj[jKey];
                                        obj.required = (_b = obj.required) !== null && _b !== void 0 ? _b : [];
                                        obj.required.push(...arr);
                                        reObj[jKey] = obj;
                                    }
                                }
                            }
                            break;
                        //#endregion
                        //#region number
                        case "multipleOf":
                            {
                                let min = reObj;
                                let max = iObj;
                                if (min > max)
                                    [min, max] = [max, min];
                                //辗转相除法 求最大公约数
                                while (max % min != 0) {
                                    const c = max % min;
                                    max = min;
                                    min = c;
                                }
                                //求出最小公倍数
                                result[iKey] = reObj * iObj / min;
                            }
                            break;
                        //#endregion
                        //#region range
                        case "maxLength":
                        case "maxItems":
                        case "maxProperties":
                        case "maximum":
                        case "exclusiveMaximum":
                            {
                                result[iKey] = Math.min(reObj, iObj);
                                // delete iSchema[iKey];
                            }
                            break;
                        case "minLength":
                        case "minItems":
                        case "minProperties":
                        case "minimum":
                        case "exclusiveMinimum":
                            {
                                result[iKey] = Math.max(reObj, iObj);
                                // delete iSchema[iKey];
                            }
                            break;
                        //#endregion
                        //#region array
                        case "items":
                            {
                                if (reObj === false) {
                                    break;
                                }
                                else if (reObj === true && iObj === false) {
                                    break;
                                }
                                let iaRe = Array.isArray(reObj);
                                let iaI = Array.isArray(iObj);
                                if (!iaRe && !iaI) {
                                    // reObj.allOf = [iObj];
                                    analysisCombining(reObj, level + 1, undefined, { allOf: [iObj] });
                                }
                                else if (iaRe && iaI) {
                                    for (let i = 0; i < iObj.length; i++) {
                                        if (reObj[i] !== undefined) {
                                            // reObj[i].allOf = [iObj[i]]; 
                                            analysisCombining(reObj[i], level + 1, undefined, { allOf: [iObj[i]] });
                                        }
                                        else {
                                            reObj[i] = iObj[i];
                                            analysisCombining(reObj[i], level + 1);
                                        }
                                    }
                                }
                                else if (iaRe && !iaI) {
                                    for (let i = 0; i < reObj.length; i++) {
                                        // reObj[i].allOf = [iObj];
                                        analysisCombining(reObj[i], level + 1, undefined, { allOf: [iObj] });
                                    }
                                }
                                else if (!iaRe && iaI) {
                                    result[iKey] = iObj;
                                    const iObj2 = reObj;
                                    result.additionalItems = reObj;
                                    for (let i = 0; i < reObj.length; i++) {
                                        // reObj[i].allOf = [iObj];
                                        analysisCombining(reObj[i], level + 1, undefined, { allOf: [iObj] });
                                    }
                                }
                            }
                            break;
                        case "additionalItems":
                            {
                                /*
                                if ((reObj === true && iObj === false) || (reObj === false && iObj === true)) {
                                    throw new SyntaxError("`additionalItems` conflict");
                                }
                                if (reObj === true) {
                                    result[iKey] = iObj;
                                } else if (iObj === true) {
                                    continue;
                                } else {
                                    // reObj.allOf = [iObj];
                                    analysisCombining(reObj, MaxCombLevel, undefined, { allOf: [iObj] });
                                }
                                */
                            }
                            break;
                        case "contains":
                            if (iObj === false) {
                                if (((_c = result.minItems) !== null && _c !== void 0 ? _c : 0) !== 0 || ((_d = result.maxItems) !== null && _d !== void 0 ? _d : 0) !== 0) {
                                    throw new SyntaxError("`contains` conflict");
                                }
                            }
                            else if (iObj === true) {
                                if (((_e = result.minItems) !== null && _e !== void 0 ? _e : 0) === 0 || ((_f = result.maxItems) !== null && _f !== void 0 ? _f : 0) === 0) {
                                    throw new SyntaxError("`contains` conflict");
                                }
                            }
                            else {
                                analysisSchema(reObj, false);
                                const tmp = (_g = iSchema[`${exports.CombindPrefix}contains`]) !== null && _g !== void 0 ? _g : [iObj];
                                if (result[`${exports.CombindPrefix}contains`] === undefined)
                                    result[`${exports.CombindPrefix}contains`] = [reObj, ...tmp];
                                else
                                    result[`${exports.CombindPrefix}contains`].push(...tmp);
                            }
                            break;
                        //#endregion
                        default:
                            break;
                    }
                }
            }
            return result;
        }, schema);
        // delete schema.allOf;
    }
    if (addMark)
        schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.AllOf] = true;
    return schema;
}
exports.analysisAllOf = analysisAllOf;
function analysisAnyOf_bak(schema, level, keysToComb, addMark = true, force = false) {
    var _a, _b, _c;
    if ((force || ((_a = schema[types_1.AnalysisMarkName]) === null || _a === void 0 ? void 0 : _a[types_1.AnalysisMarkEnum.AnyOf]) === undefined) && ((_b = schema.anyOf) === null || _b === void 0 ? void 0 : _b[0]) !== undefined) {
        if (((_c = schema.anyOf) === null || _c === void 0 ? void 0 : _c.length) === 1) {
            if (schema.allOf === undefined) {
                schema.allOf = schema.anyOf;
            }
            else {
                schema.allOf.push(schema.anyOf[0]);
            }
            delete schema.anyOf;
        }
        else {
            let anyOf_bak = schema.anyOf;
            delete schema.anyOf;
            let schemaDup;
            let success = false;
            for (let iSchema of anyOf_bak) {
                analysisSchema(iSchema, false);
                schemaDup = lodash_1.default.cloneDeep(schema);
                try {
                    analysisCombining(schemaDup, level + 1, undefined, { allOf: [iSchema] }, true, true);
                    success = true;
                    analysisCombining(schema, level + 1, undefined, { allOf: [iSchema] }, true, true);
                    break;
                }
                catch (err) {
                    // debugger;
                }
            }
            if (!success) {
                // debugger;
                throw new SyntaxError("`anyOf` ERROR");
            }
        }
    }
    if (addMark)
        schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.AnyOf] = true;
    return schema;
}
exports.analysisAnyOf_bak = analysisAnyOf_bak;
function analysisAnyOf(schema, level, keysToComb, addMark = true, force = false) {
    var _a, _b, _c;
    if ((force || ((_a = schema[types_1.AnalysisMarkName]) === null || _a === void 0 ? void 0 : _a[types_1.AnalysisMarkEnum.AnyOf]) === undefined) && ((_b = schema.anyOf) === null || _b === void 0 ? void 0 : _b[0]) !== undefined) {
        if (((_c = schema.anyOf) === null || _c === void 0 ? void 0 : _c.length) === 1) {
            if (schema.allOf === undefined) {
                schema.allOf = schema.anyOf;
            }
            else {
                schema.allOf.push(schema.anyOf[0]);
            }
            delete schema.anyOf;
        }
        else {
            let anyOf_bak = schema.anyOf;
            delete schema.anyOf;
            const imposableSchemas = [];
            let itemsIdxArr = [];
            for (let i = anyOf_bak.length - 1; i > -1; i--) {
                itemsIdxArr.unshift(i);
            }
            itemsIdxArr = mockjs_1.Random.shuffle(itemsIdxArr);
            while (true) {
                let idx = itemsIdxArr.pop();
                if (idx === undefined) {
                    throw new SyntaxError("all items in `anyOf` invalid");
                }
                try {
                    let schemaDup = lodash_1.default.cloneDeep(schema);
                    ;
                    let iSchema = anyOf_bak[idx];
                    analysisSchema(iSchema, false);
                    analysisCombining(schemaDup, level + 1, undefined, { allOf: [iSchema] }, true, true);
                    //
                    analysisCombining(schema, level + 1, undefined, { allOf: [iSchema] }, true, true);
                    break;
                }
                catch (err) {
                    imposableSchemas.push(idx);
                }
            }
            /*
                        for (let i = anyOf_bak.length - 1; i > -1; i--) {
                            if (imposableSchemas.includes(i)) {
                                anyOf_bak.pop();
                            }
                        }
             */
        }
    }
    if (addMark)
        schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.AnyOf] = true;
    return schema;
}
exports.analysisAnyOf = analysisAnyOf;
function analysisOneOf(schema, level, keysToComb, addMark = true, force = false) {
    var _a, _b, _c;
    if ((force || ((_a = schema[types_1.AnalysisMarkName]) === null || _a === void 0 ? void 0 : _a[types_1.AnalysisMarkEnum.OneOf]) === undefined) && ((_b = schema.oneOf) === null || _b === void 0 ? void 0 : _b[0]) !== undefined) {
        if (((_c = schema.oneOf) === null || _c === void 0 ? void 0 : _c.length) === 1) {
            if (schema.allOf === undefined) {
                schema.allOf = schema.oneOf;
            }
            else {
                schema.allOf.push(schema.oneOf[0]);
            }
            delete schema.oneOf;
        }
        else {
            let oneOf_bak = schema.oneOf;
            delete schema.oneOf;
            let itemsIdxArr = [];
            for (let i = oneOf_bak.length - 1; i > -1; i--) {
                itemsIdxArr.unshift(i);
            }
            itemsIdxArr = mockjs_1.Random.shuffle(itemsIdxArr);
            while (true) {
                let idx = itemsIdxArr.pop();
                if (idx === undefined) {
                    throw new SyntaxError("all items in `oneOf` invalid");
                }
                try {
                    let schemaDup = lodash_1.default.cloneDeep(schema);
                    ;
                    let iSchema = oneOf_bak[idx];
                    analysisSchema(iSchema, false);
                    analysisCombining(schemaDup, level + 1, undefined, { allOf: [iSchema] }, true, true);
                    //
                    analysisCombining(schema, level + 1, undefined, { allOf: [iSchema] }, true, true);
                    break;
                }
                catch (err) {
                }
            }
        }
    }
    if (addMark)
        schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.OneOf] = true;
    return schema;
}
exports.analysisOneOf = analysisOneOf;
//#endregion
