"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisObject = exports.TypesToRandom = exports.RandomTypeArr = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mockjs_1 = require("mockjs");
const types_1 = require("../types");
const ArrayUtil_1 = require("../utils/ArrayUtil");
const default_1 = require("./default");
exports.RandomTypeArr = [
    () => mockjs_1.Random.string(0, 4),
    () => mockjs_1.Random.boolean(),
    () => mockjs_1.Random.integer(-1000, 1000),
    () => mockjs_1.Random.float(-1000, 1000),
    () => ({}),
    () => null,
    () => [0]
];
exports.TypesToRandom = ["string", "boolean", "integer", "number"];
function analysisObject(schema) {
    var _a, _b;
    if (schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Object] === undefined) {
        let min = (_a = schema.minProperties) !== null && _a !== void 0 ? _a : 0;
        let required = (_b = schema.required) !== null && _b !== void 0 ? _b : [];
        let requiredLen = required.length;
        min = Math.max(min, requiredLen);
        let max = schema.maxProperties; //?? min + 5;
        let allowKeys;
        let allowAdditional;
        // let properties = schema.properties;
        // let propertyKeys = properties !== undefined ? Object.keys(properties) : [];
        let keyPatterns;
        let allowPattern;
        if (ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.propertyNames) && schema.propertyNames.const !== undefined) {
            allowKeys = [schema.propertyNames.const];
            allowAdditional = false;
            keyPatterns = [];
            allowPattern = false;
            max = 1;
            if (max < min) {
                throw SyntaxError('`max` conflict with `required`');
            }
        }
        else {
            if (max !== undefined && max < min) {
                throw SyntaxError('`max` conflict with `required`');
            }
            allowAdditional = ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.additionalProperties) ? true : schema.additionalProperties !== false;
            let properties = schema.properties;
            let propertyKeys = properties !== undefined ? Object.keys(properties) : [];
            keyPatterns = schema.patternProperties ? Object.keys(schema.patternProperties) : [];
            allowPattern = true;
            const pn = schema.propertyNames;
            if (pn !== undefined && pn !== true) {
                const pn2 = pn;
                if (pn2.enum === undefined
                    && (pn2.pattern === undefined || pn2.pattern === "")) {
                    delete schema.propertyNames;
                }
                else {
                    const patternReg = (pn2.pattern === undefined || pn2.pattern === "") ? undefined : new RegExp(pn2.pattern);
                    if (patternReg) {
                        keyPatterns.push(pn2.pattern);
                    }
                    let tmpKeys = [];
                    for (let iPk of required) {
                        if (pn2.enum !== undefined && !pn2.enum.includes(iPk)) {
                            break;
                        }
                        if (patternReg && !patternReg.test(iPk)) {
                            break;
                        }
                        tmpKeys.push(iPk);
                    }
                    ;
                    if (tmpKeys.length !== requiredLen) {
                        throw SyntaxError('`propertyNames.enum` or `propertyNames.pattern` conflict with `required`');
                    }
                    tmpKeys = [];
                    if (pn2.enum !== undefined) {
                        allowPattern = false;
                        for (let iPk of pn2.enum) {
                            if (required.includes(iPk)) {
                                continue;
                            }
                            if (patternReg && !patternReg.test(iPk)) {
                                continue;
                            }
                            tmpKeys.push(iPk);
                        }
                        ;
                    }
                    for (let iPk of propertyKeys) {
                        if (required.includes(iPk)) {
                            continue;
                        }
                        if (pn2.enum !== undefined && !pn2.enum.includes(iPk)) {
                            continue;
                        }
                        if (patternReg && !patternReg.test(iPk)) {
                            continue;
                        }
                        tmpKeys.push(iPk);
                    }
                    ;
                    allowKeys = tmpKeys;
                    allowAdditional = pn2.enum === undefined ? allowAdditional : false;
                }
            }
            if (allowAdditional === false && max !== undefined && max < propertyKeys.length) {
                throw SyntaxError('`max` conflict with `propertyNames`');
            }
            if (propertyKeys.length === 0) {
                delete schema.properties;
            }
            if (allowKeys === undefined) {
                allowKeys = ArrayUtil_1.ArrayUtil.difference(propertyKeys, required);
            }
            keyPatterns = allowPattern ? keyPatterns : [];
        }
        let depkeys = {};
        let toCheckKeys = schema.dependencies ? Object.keys(schema.dependencies) : [];
        let depSchemas = {};
        for (let iCKey of toCheckKeys) {
            depkeys[iCKey] = ArrayUtil_1.ArrayUtil.unique(getDepArrKeys(schema, {}, depSchemas, iCKey));
        }
        if (allowKeys !== undefined) {
            for (let iKey in depkeys) {
                allowKeys.push(...depkeys[iKey]);
            }
            allowKeys = ArrayUtil_1.ArrayUtil.difference(ArrayUtil_1.ArrayUtil.unique(allowKeys), required);
        }
        const re = schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Object] = { min, max, required, requiredLen, allowKeys, allowAdditional, keyPatterns, allowPattern, depkeys, depSchemas };
        return re;
    }
    return schema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.Object];
}
exports.analysisObject = analysisObject;
function getDepArrKeys(schema, keysChecked, depSchemas, gKey) {
    var _a, _b, _c;
    let newKeys = [gKey];
    if (Array.isArray((_a = schema.dependencies) === null || _a === void 0 ? void 0 : _a[gKey])) {
        keysChecked[gKey] = true;
        let tmp = [gKey, ...schema.dependencies[gKey]];
        // tmp.push(...(<string[]>schema.dependencies![gKey]!));
        tmp = ArrayUtil_1.ArrayUtil.unique(tmp);
        for (let iKey of tmp) {
            if (!keysChecked[iKey]) {
                newKeys.push(...getDepArrKeys(schema, keysChecked, depSchemas, iKey));
            }
        }
    }
    else if (ArrayUtil_1.ArrayUtil.isObjectNotArray((_b = schema.dependencies) === null || _b === void 0 ? void 0 : _b[gKey])) {
        keysChecked[gKey] = true;
        const obj = schema.dependencies[gKey];
        let tmp = [gKey];
        if (obj.required !== undefined) {
            tmp.push(...obj.required);
            for (let iKey of tmp) {
                if (!keysChecked[iKey]) {
                    newKeys.push(...getDepArrKeys(schema, keysChecked, depSchemas, iKey));
                }
            }
        }
        const tmpSchema = lodash_1.default.cloneDeep(schema);
        const bak_dep = tmpSchema.dependencies;
        delete tmpSchema[types_1.AnalysisMarkName][types_1.AnalysisMarkEnum.AllOf];
        tmpSchema.required = ArrayUtil_1.ArrayUtil.unique((_c = tmpSchema.required) !== null && _c !== void 0 ? _c : [], tmp);
        default_1.analysisSchema(tmpSchema, false, { allOf: [obj] });
        schema.dependencies = bak_dep;
        delete tmpSchema.dependencies[gKey];
        delete tmpSchema.allOf;
        delete tmpSchema.anyOf;
        delete tmpSchema.oneOf;
        depSchemas[gKey] = tmpSchema;
    }
    return newKeys;
}
