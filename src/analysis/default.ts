import _ from "lodash";
import { Random } from "mockjs";
import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types";
import { ArrayUtil } from "../utils/ArrayUtil";
import { RegExpUtil } from "../utils/RegExpUtil";





//#region resolve schema
export function analysisSchema(orgSchema: SchemaExt, clone: boolean, extra: { [key: string]: any } = {}): SchemaExt {
    let schema = clone ? _.cloneDeep(orgSchema) : orgSchema;
    schema[AnalysisMarkName] = schema[AnalysisMarkName] ?? {};
    const bak: { [key: string]: any } = {};
    for (let iKey in extra) {
        bak[iKey] = (<any>schema)[iKey];
        (<any>schema)[iKey] = extra[iKey];
    }
    // analysisExamples(schema);

    analysisCombining(schema, 0);

    for (let iKey in extra) {

        if (bak[iKey] === undefined) {
            delete (<any>schema)[iKey];
        }
        else {
            (<any>schema)[iKey] = bak[iKey];
        }
    }
    return schema;
}

const CombProperties = new Set(["x-mock-tpl", "type", "const", "enum", "format", "uniqueItems", "required", "pattern", "propertyNames", "properties", "additionalProperties", "multipleOf", "maxLength", "maxItems", "maxProperties", "maximum", "exclusiveMaximum", "minLength", "minItems", "minProperties", "minimum", "exclusiveMinimum", "items", "additionalItems", "contains", "dependencies", "patternProperties"]);

export function analysisCombining(schema: SchemaExt, level: number, keysToComb?: Set<string>, extra: { [key: string]: any } = {}, addMark: boolean = true, force: boolean = false): void {
    if (!ArrayUtil.isObjectNotArray(schema))
        return;
    schema[AnalysisMarkName] = schema[AnalysisMarkName] ?? {};
    //#region 
    const bak: { [key: string]: any } = {};
    for (let iKey in extra) {
        bak[iKey] = (<any>schema)[iKey];
        (<any>schema)[iKey] = extra[iKey];
    }


    if (schema!.oneOf?.length === 1) {
        if (schema.allOf === undefined) {
            schema.allOf = schema.oneOf;
        } else {
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
            delete (<any>schema)[iKey];
        }
        else {
            (<any>schema)[iKey] = bak[iKey];
        }
    }
}

export const CombindPrefix = "x-combind-";

export function analysisAllOf(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark: boolean = true, force: boolean = false): SchemaExt {
    if ((force || schema[AnalysisMarkName]?.[AnalysisMarkEnum.AllOf] === undefined) && schema.allOf?.[0] !== undefined) {
        _.reduce(schema.allOf, (result: any, iSchema: any) => {
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
                        result[`${CombindPrefix}contains`] = [iObj];
                    }
                } else if (iObj !== undefined) {
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
                                result[iKey] = ArrayUtil.intersection(
                                    Array.isArray(reObj) ? reObj : [reObj],
                                    Array.isArray(iObj) ? iObj : [iObj]
                                );
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
                            result[iKey] = RegExpUtil.getMergedReg(result[iKey], iObj);
                            // result[iKey] += `(.+)?${iObj}`;
                            break;
                        //#endregion

                        //#region object
                        case "propertyNames":
                            if (reObj === false) {
                                break;
                            } else if (reObj === true && iObj === false) {
                                break;
                            }
                            analysisCombining(iObj, level + 1, new Set(['const', 'pattern', 'enum']));

                            if (reObj === undefined) {
                                reObj.const = iObj.const;
                            }
                            else if (reObj.const !== iObj.const) {
                                throw new SyntaxError("conflict with `propertyNames.const`")
                            }

                            if (reObj.pattern === undefined || reObj.pattern === "") {
                                reObj.pattern = iObj.pattern;
                            }
                            else {
                                reObj.pattern = RegExpUtil.getMergedReg(reObj.pattern, iObj.pattern);
                                // reObj.pattern = (reObj.pattern ?? "") + `(.+)?${iObj.pattern}`;
                            }

                            if (iObj.enum !== undefined) {
                                reObj.enum = reObj.enum ? ArrayUtil.intersection(reObj.enum, iObj.enum) : iObj.enum;
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
                                } else if (reObj === true && iObj === false) {
                                    break;
                                }
                                analysisSchema(iObj, false);
                                analysisCombining(reObj, level + 1, undefined, { allOf: [iObj] }, false);

                                delete reObj.allOf?.additionalProperties;
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
                                        reObj[jKey] = ArrayUtil.unique([reObj[jKey], iObj[jKey]]);
                                    }
                                    else if (ArrayUtil.isObjectNotArray(reObj[jKey]) && ArrayUtil.isObjectNotArray(iObj[jKey])) {
                                        // both are `schema`
                                        analysisCombining(reObj[jKey], level + 1, undefined, { allOf: [iObj[jKey]] }, false), true;
                                    }
                                    else {
                                        // one is `array`, the other is `schema`
                                        let tmp = Array.isArray(reObj[jKey]);
                                        let obj: SchemaExt = tmp ? iObj[jKey] : reObj[jKey];
                                        let arr: string[] = tmp ? reObj[jKey] : iObj[jKey];
                                        obj.required = obj.required ?? [];
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
                                let min: number = reObj;
                                let max: number = iObj;
                                if (min > max) [min, max] = [max, min];
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
                                } else if (reObj === true && iObj === false) {
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
                                } else if (!iaRe && iaI) {
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
                                if ((result.minItems ?? 0) !== 0 || (result.maxItems ?? 0) !== 0) {
                                    throw new SyntaxError("`contains` conflict");
                                }

                            }
                            else if (iObj === true) {
                                if ((result.minItems ?? 0) === 0 || (result.maxItems ?? 0) === 0) {
                                    throw new SyntaxError("`contains` conflict");
                                }
                            }
                            else {
                                analysisSchema(reObj, false);

                                const tmp = iSchema[`${CombindPrefix}contains`] ?? [iObj];

                                if (result[`${CombindPrefix}contains`] === undefined)
                                    result[`${CombindPrefix}contains`] = tmp;
                                else
                                    result[`${CombindPrefix}contains`].push(...tmp);
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
        schema[AnalysisMarkName]![AnalysisMarkEnum.AllOf] = true;
    return schema;
}

export function analysisAnyOf_bak(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark: boolean = true, force: boolean = false): SchemaExt {
    if ((force || schema[AnalysisMarkName]?.[AnalysisMarkEnum.AnyOf] === undefined) && schema.anyOf?.[0] !== undefined) {

        if (schema!.anyOf?.length === 1) {
            if (schema.allOf === undefined) {
                schema.allOf = schema.anyOf;
            } else {
                schema.allOf.push(schema.anyOf[0]);
            }
            delete schema.anyOf;
        }
        else {
            let anyOf_bak = schema.anyOf!;
            delete schema.anyOf;

            let schemaDup: SchemaExt;
            let success: boolean = false;

            for (let iSchema of anyOf_bak) {
                analysisSchema(iSchema, false);
                schemaDup = _.cloneDeep(schema);
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
        schema[AnalysisMarkName]![AnalysisMarkEnum.AnyOf] = true;
    return schema;
}


export function analysisAnyOf(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark: boolean = true, force: boolean = false): SchemaExt {
    if ((force || schema[AnalysisMarkName]?.[AnalysisMarkEnum.AnyOf] === undefined) && schema.anyOf?.[0] !== undefined) {

        if (schema!.anyOf?.length === 1) {
            if (schema.allOf === undefined) {
                schema.allOf = schema.anyOf;
            } else {
                schema.allOf.push(schema.anyOf[0]);
            }
            delete schema.anyOf;
        }
        else {
            let anyOf_bak = schema.anyOf!;
            delete schema.anyOf;

            const imposableSchemas: number[] = [];

            let itemsIdxArr: number[] = [];
            for (let i = anyOf_bak.length - 1; i > -1; i--) {
                itemsIdxArr.unshift(i);
            }
            itemsIdxArr = Random.shuffle(itemsIdxArr);
            while (true) {
                let idx = itemsIdxArr.pop();
                if (idx === undefined) {
                    throw new SyntaxError("all items in `anyOf` invalid");
                }
                try {

                    let schemaDup: SchemaExt = _.cloneDeep(schema);;
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
        schema[AnalysisMarkName]![AnalysisMarkEnum.AnyOf] = true;
    return schema;
}

export function analysisOneOf(schema: SchemaExt, level: number, keysToComb?: Set<string>, addMark: boolean = true, force: boolean = false): SchemaExt {
    if ((force || schema[AnalysisMarkName]?.[AnalysisMarkEnum.OneOf] === undefined) && schema.oneOf?.[0] !== undefined) {

        if (schema!.oneOf?.length === 1) {
            if (schema.allOf === undefined) {
                schema.allOf = schema.oneOf;
            } else {
                schema.allOf.push(schema.oneOf[0]);
            }
            delete schema.oneOf;
        }
        else {
            let oneOf_bak = schema.oneOf!;
            delete schema.oneOf;

            let itemsIdxArr: number[] = [];
            for (let i = oneOf_bak.length - 1; i > -1; i--) {
                itemsIdxArr.unshift(i);
            }
            itemsIdxArr = Random.shuffle(itemsIdxArr);
            while (true) {
                let idx = itemsIdxArr.pop();
                if (idx === undefined) {
                    throw new SyntaxError("all items in `oneOf` invalid");
                }
                try {

                    let schemaDup: SchemaExt = _.cloneDeep(schema);;
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
        schema[AnalysisMarkName]![AnalysisMarkEnum.OneOf] = true;
    return schema;
}

//#endregion

