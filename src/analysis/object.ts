import _ from "lodash";
import { Random } from "mockjs";
import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types"
import { ArrayUtil } from "../utils/ArrayUtil";
import { analysisSchema } from "./default";


export const RandomTypeArr = [
    () => Random.string(0, 4),
    () => Random.boolean(),
    () => Random.integer(-1000, 1000),
    () => Random.float(-1000, 1000),
    () => ({}),
    () => null,
    () => [0]
];

export const TypesToRandom = ["string", "boolean", "integer", "number"];

export function analysisObject(schema: SchemaExt): AnalysisObjectResult {
    if (schema[AnalysisMarkName]![AnalysisMarkEnum.Object] === undefined) {

        let min = schema.minProperties ?? 0;
        let required = schema.required ?? [];
        let requiredLen = required.length;
        min = Math.max(min, requiredLen);
        let max = schema.maxProperties //?? min + 5;


        let allowKeys: string[] | undefined;
        let allowAdditional: boolean

        // let properties = schema.properties;
        // let propertyKeys = properties !== undefined ? Object.keys(properties) : [];
        let keyPatterns: string[];
        let allowPattern: boolean;

        if (ArrayUtil.isObjectNotArray(schema.propertyNames) && (<SchemaExt>schema.propertyNames)!.const !== undefined) {
            allowKeys = [(<SchemaExt>schema.propertyNames).const];
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

            allowAdditional = ArrayUtil.isObjectNotArray(schema.additionalProperties) ? true : schema.additionalProperties !== false;

            let properties = schema.properties;
            let propertyKeys = properties !== undefined ? Object.keys(properties) : [];
            keyPatterns = schema.patternProperties ? Object.keys(schema.patternProperties!) : [];
            allowPattern = true;

            const pn = schema.propertyNames;
            if (pn !== undefined && pn !== true) {
                const pn2 = <SchemaExt>pn;
                if (pn2.enum === undefined
                    && (pn2.pattern === undefined || pn2.pattern === "")) {
                    delete schema.propertyNames;
                }
                else {
                    const patternReg = (pn2.pattern === undefined || pn2.pattern === "") ? undefined : new RegExp(pn2.pattern!);
                    if (patternReg) {
                        keyPatterns.push(pn2.pattern!);
                    }
                    let tmpKeys: string[] = [];

                    for (let iPk of required) {
                        if (pn2.enum !== undefined && !pn2.enum.includes(iPk)) {
                            break;
                        }
                        if (patternReg && !patternReg.test(iPk)) {
                            break;
                        }
                        tmpKeys.push(iPk);
                    };
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
                        };
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
                    };

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
                allowKeys = ArrayUtil.difference(propertyKeys, required);
            }

            keyPatterns = allowPattern ? keyPatterns : [];
        }

        let depkeys: { [key: string]: string[] } = {};
        let toCheckKeys = schema.dependencies ? Object.keys(schema.dependencies) : [];
        let depSchemas: { [key: string]: SchemaExt } = {};
        for (let iCKey of toCheckKeys) {
            depkeys[iCKey] = ArrayUtil.unique(getDepArrKeys(schema, {}, depSchemas, iCKey));
        }

        if (allowKeys !== undefined) {
            for (let iKey in depkeys) {
                allowKeys.push(...depkeys[iKey]);
            }
            allowKeys = ArrayUtil.difference(ArrayUtil.unique(allowKeys), required);
        }

        const re = schema[AnalysisMarkName]![AnalysisMarkEnum.Object] = { min, max, required, requiredLen, allowKeys, allowAdditional, keyPatterns, allowPattern, depkeys, depSchemas };
        return re;

    }
    return schema[AnalysisMarkName]![AnalysisMarkEnum.Object]!
}

function getDepArrKeys(schema: any, keysChecked: { [key: string]: true }, depSchemas: { [key: string]: SchemaExt }, gKey: string) {
    let newKeys: string[] = [gKey];
    if (Array.isArray(schema.dependencies?.[gKey])) {
        keysChecked[gKey] = true;
        let tmp: string[] = [gKey, ...(<string[]>schema.dependencies![gKey]!)];
        // tmp.push(...(<string[]>schema.dependencies![gKey]!));
        tmp = ArrayUtil.unique(tmp);
        for (let iKey of tmp) {
            if (!keysChecked[iKey]) {
                newKeys.push(...getDepArrKeys(schema, keysChecked, depSchemas, iKey));
            }
        }
    } else if (ArrayUtil.isObjectNotArray(schema.dependencies?.[gKey])) {
        keysChecked[gKey] = true;
        const obj = <SchemaExt>schema.dependencies[gKey];
        let tmp: string[] = [gKey];
        if (obj.required !== undefined) {
            tmp.push(...obj.required);
            for (let iKey of tmp) {
                if (!keysChecked[iKey]) {
                    newKeys.push(...getDepArrKeys(schema, keysChecked, depSchemas, iKey));
                }
            }
        }
        const tmpSchema = _.cloneDeep(schema);
        const bak_dep = tmpSchema.dependencies;
        delete tmpSchema[AnalysisMarkName][AnalysisMarkEnum.AllOf];
        tmpSchema.required = ArrayUtil.unique(tmpSchema.required ?? [], tmp);
        analysisSchema(tmpSchema, false, { allOf: [obj] });
        schema.dependencies = bak_dep;
        delete tmpSchema.dependencies[gKey];
        delete tmpSchema.allOf;
        delete tmpSchema.anyOf;
        delete tmpSchema.oneOf;

        depSchemas[gKey] = tmpSchema;
    }
    return newKeys;
}

export type AnalysisObjectResult = {
    min: number;
    max?: number;
    required: string[];
    requiredLen: number;
    allowAdditional: boolean;
    allowKeys: string[];
    keyPatterns: string[];
    allowPattern: boolean;
    depkeys: { [key: string]: string[] };
    depSchemas: { [key: string]: SchemaExt };
}