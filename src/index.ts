import fs, { PathLike } from "fs";
import http from "http";
import _ from "lodash";
import jsonschema from "jsonschema";
import Mock, { Random } from "mockjs";
import path from "path";
import { analysisArray } from "./analysis/array";
import { analysisSchema, CombindPrefix } from "./analysis/default";
import { analysisInteger } from "./analysis/integer";
import { analysisNumber } from "./analysis/number";
import { analysisObject, RandomTypeArr, TypesToRandom } from "./analysis/object";
import { analysisString } from "./analysis/string";
import { SchemaExt } from "./types";
import { ArrayUtil } from "./utils/ArrayUtil";
import { RegExpUtil } from "./utils/RegExpUtil";
import mockjs from "mockjs";
import { JsonUtil } from "./utils/JsonUtil";
import { HttpUtil } from "./utils/HttpUtil";


Random.tld = function () { // Top Level Domain
    return this.pick(
        (
            // 域名后缀
            'com net org edu gov int mil cn ' +
            // 国内域名
            'com.cn net.cn gov.cn org.cn ' +
            // 中文国内域名
            // '中国 中国互联.公司 中国互联.网络 ' +
            // 新国际域名
            'tel biz cc tv info name hk mobi asia cd travel pro museum coop aero ' +
            // 世界各国域名后缀
            'ad ae af ag ai al am an ao aq ar as at au aw az ba bb bd be bf bg bh bi bj bm bn bo br bs bt bv bw by bz ca cc cf cg ch ci ck cl cm cn co cq cr cu cv cx cy cz de dj dk dm do dz ec ee eg eh es et ev fi fj fk fm fo fr ga gb gd ge gf gh gi gl gm gn gp gr gt gu gw gy hk hm hn hr ht hu id ie il in io iq ir is it jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md mg mh ml mm mn mo mp mq mr ms mt mv mw mx my mz na nc ne nf ng ni nl no np nr nt nu nz om qa pa pe pf pg ph pk pl pm pn pr pt pw py re ro ru rw sa sb sc sd se sg sh si sj sk sl sm sn so sr st su sy sz tc td tf tg th tj tk tm tn to tp tr tt tv tw tz ua ug uk us uy va vc ve vg vn vu wf ws ye yu za zm zr zw'
        ).split(' ')
    )
}

export class SchemaMock {

    protected static _instances: { [name: string]: SchemaMock } = {};

    protected readonly _orgSchema: SchemaExt;

    /**
     * the orgin schema from `#parser`
     * @see #parser
     */
    public get schema() {
        return this._orgSchema;
    }

    public get analysisSchema() {
        return this._analysisSchema;
    }

    protected _analysisSchema: SchemaExt;

    protected constructor(schema: SchemaExt) {
        this._orgSchema = _.cloneDeep(schema);
        this._analysisSchema = _.cloneDeep(schema);
    }


    /**
     * get one mock data
     * @param jspath like : "#/a/b/0/d". MUST startWith "#/"
     */
    mock(jspath: string | Partial<MockOptions> = {}) {
        if (typeof jspath === "string") {
            jspath = { jspath };
        }
        const opt: MockOptions = Object.assign({ path: "", skipMockAtts: [], requiredOnly: false }, jspath);
        const node = JsonUtil.getValueByJSPath(this.analysisSchema, opt.jspath!);
        return SchemaMock.mock(node, opt);
    }

    protected static mock(orgSchema: SchemaExt, options: Partial<MockOptions> = {}): any {
        let schema = analysisSchema(orgSchema, false);
        let result: any

        if (schema.const !== undefined) {
            result = schema.const;
            return result;
        }

        if (schema["x-mock-tpl"] !== undefined) {
            const re = mockjs.mock({ ROOT: schema["x-mock-tpl"] });
            return re.ROOT;
        }

        if (schema.enum !== undefined) {
            let enumIdxArr: number[] = [];
            for (let i = schema.enum.length - 1; i > -1; i--) {
                enumIdxArr.unshift(i);
            }
            enumIdxArr = Random.shuffle(enumIdxArr);
            while (true) {
                let idx = enumIdxArr.pop();
                if (idx === undefined) {
                    throw new SyntaxError("all items in `enum` invalid");
                }

                try {
                    result = schema.enum[idx];
                    jsonschema.validate(schema.enum[idx], schema, { throwFirst: true });
                    break;
                }
                catch (err) {
                }
            }
            return result;
        }

        const _options: MockOptions = Object.assign(
            {
                skipMockAtts: [], requiredOnly: false
            }, options);

        const type = Array.isArray(schema.type) ? Random.pick(schema.type) : schema.type ?? Random.pick(TypesToRandom);


        switch (type) {
            case undefined:
                result = Random.pick(RandomTypeArr)();
                break;

            case "array":
                {
                    let arr: any[] = [];
                    let { min, max, uniqueItems, itemTuple, items, allowAdditional, additionalItems, containsArr } = analysisArray(schema);
                    const maxCounter = Random.integer(min, max);
                    let containsAllDone: boolean = containsArr.length === 0;
                    let containsDone: true[] = [];
                    for (let i = 1; i <= maxCounter || !containsAllDone; i++) {

                        //#region 
                        // let iItem = Random.pick(RandomTypeArr)();
                        let iSchema: SchemaExt | undefined;

                        if (itemTuple) {
                            iSchema = items[i - 1];
                            if (iSchema === undefined) {
                                if (!containsAllDone) {
                                    for (let j in containsArr) {
                                        if (!containsDone[j]) {
                                            iSchema = containsArr[j];
                                            break;
                                        }
                                    }
                                } else {
                                    iSchema = additionalItems;

                                }
                            }

                        }
                        else {
                            iSchema = items[0];
                            if (!containsAllDone) {
                                for (let j in containsArr) {
                                    if (!containsDone[j]) {
                                        iSchema = containsArr[j];
                                        break;
                                    }
                                }
                            } else {
                                iSchema = items[0];
                            }
                        }

                        if (iSchema === undefined && !allowAdditional)
                            break;

                        let iItem: any;
                        if (iSchema === undefined) {
                            iItem = Random.pick(RandomTypeArr)();
                        }
                        else {
                            iItem = this.mock(iSchema);
                        }

                        //#endregion
                        if (uniqueItems) {
                            let toBreak = false;
                            let toContinue = false;
                            let arrLen = arr.length;
                            for (let jItem of arr) {
                                if (_.isEqual(iItem, jItem)) {
                                    if (arrLen >= min) {
                                        toBreak = true;
                                        break
                                    }
                                    i--;
                                    toContinue = true;
                                    break;
                                }
                            }
                            if (toBreak)
                                break;
                            if (toContinue)
                                continue;
                        }

                        if (!containsAllDone) {
                            let remain = containsArr.length;
                            for (let j in containsArr) {
                                if (!containsDone[j]) {
                                    const validResult = jsonschema.validate(iItem, containsArr[j]);
                                    if (validResult.errors.length === 0) {
                                        containsDone[j] = true;
                                        remain--;
                                    }
                                } else {
                                    remain--;
                                }
                            }
                            if (remain === 0) {
                                containsAllDone = true;
                            }
                        }

                        arr.push(iItem);
                    }
                    result = arr;
                }
                break;

            case "object":
                {
                    let obj: { [key: string]: any } = {};

                    let { min, max, required, requiredLen, allowKeys, allowAdditional, keyPatterns, allowPattern, depkeys, depSchemas } = analysisObject(schema);

                    if (_options.requiredOnly) {
                        min = max = requiredLen;
                    }
                    if (
                        schema.properties === undefined
                        && schema.patternProperties === undefined
                        && (schema.propertyNames === undefined || schema.propertyNames === true)
                        && !ArrayUtil.isObjectNotArray(schema.additionalProperties)
                        && schema.dependencies === undefined
                    ) {
                        const maxCounter = Random.integer(min, max ?? min + 5);
                        const arr = RandomTypeArr;
                        for (let counter = 1; counter <= maxCounter; counter++) {
                            const key = required[counter - 1] ?? (Random.string(1, 4) + counter);
                            const value = Random.pick(arr)();
                            obj[key] = value;
                        }
                    } else {
                        const maxCounter = allowAdditional ? Random.integer(min, max ?? min + 5) : Math.min(max ?? min + 5, requiredLen + allowKeys.length);
                        schema.properties = schema.properties ?? (allowKeys.length > 0 ? {} : (allowPattern ? {} : undefined));
                        if (schema.properties !== undefined) {
                            allowKeys = [...allowKeys];
                            const properties = schema.properties;
                            const arr = RandomTypeArr;
                            const tmpReg: { [key: string]: RegExp } = {};
                            // const maxTryTimes = keyPatterns.length * 2 + allowKeys.length;
                            if (allowAdditional)
                                allowKeys = Random.shuffle(allowKeys);
                            for (let counter = 1; counter <= maxCounter;) {
                                let key = required[counter - 1];
                                // let keysDep: string[] = [key];
                                let keysDep: string[] = [...(depkeys[key] ?? [key])];
                                if (key === undefined) {
                                    let tryTimes = 0;
                                    let useAllowKey: boolean;
                                    function genAllowKey() {
                                        useAllowKey = true;
                                        return allowKeys[0];
                                    }
                                    function genPatternKey() {
                                        let p: string = Random.pick(keyPatterns);
                                        p = RegExpUtil.fixPattern(p);
                                        tmpReg[p] = new RegExp(p);
                                        return Mock.mock(tmpReg[p]);
                                    }
                                    do {
                                        useAllowKey = false;

                                        if (!allowAdditional && keyPatterns.length == 0 && allowKeys.length == 0) {
                                            debugger;
                                            throw new SyntaxError("cannot mock a `property name`");
                                        }
                                        else if (allowAdditional && ((keyPatterns.length == 0 && allowKeys.length == 0))) {
                                            key = (Random.string(1, 4) + counter);
                                        }
                                        else if (keyPatterns.length == 0 && allowKeys.length > 0) {
                                            key = genAllowKey();
                                        }
                                        else if (allowPattern && keyPatterns.length > 0 && allowKeys.length == 0) {
                                            key = genPatternKey()
                                        } else {
                                            key = Random.boolean() ? genAllowKey() : genPatternKey();
                                        }

                                        tryTimes++;
                                        keysDep = [key];
                                        if (obj[key] === undefined) {
                                            keysDep = [...(depkeys[key] ?? [key])];
                                            for (let idx = keysDep.length - 1; idx > -1; idx--) {
                                                if (obj[keysDep[idx]] !== undefined) {
                                                    keysDep.splice(idx, 1);
                                                }
                                            }
                                            if (counter + keysDep.length - 1 > maxCounter) {
                                                const idx = allowKeys.indexOf(key);
                                                if (idx > -1)
                                                    allowKeys.splice(idx, 1);
                                                continue;
                                            }
                                            break;
                                        } else {
                                            break;
                                        }

                                    } while (true);
                                    // counter += keysDep.length - 1;
                                    if (useAllowKey) {
                                        for (let iKey of keysDep) {
                                            const idx = allowKeys.indexOf(iKey);
                                            if (idx > -1) allowKeys.splice(idx, 1);
                                        }
                                    }
                                }

                                // const depValue: { [key: string]: any } = {};
                                for (let iKey of keysDep) {
                                    let value: any;
                                    if (obj[iKey] !== undefined) {
                                        // value = depValue[iKey];
                                        counter++;
                                        continue;
                                    }
                                    else if (depSchemas[iKey] !== undefined) {
                                        const tmp = this.mock(depSchemas[iKey], { ...options, requiredOnly: true });
                                        Object.assign(obj, tmp);
                                        counter += Object.keys(tmp).length;
                                        break;
                                        // for (let i in tmp) {
                                        //     depValue[i] = tmp[i];
                                        // }
                                    }
                                    else if (properties[iKey] !== undefined) {
                                        value = this.mock(properties[iKey], options);
                                    }
                                    else {
                                        if (allowPattern && keyPatterns !== undefined) {
                                            for (let j in schema.patternProperties) {
                                                const jReg = tmpReg[j] ?? (tmpReg[j] = new RegExp(j));
                                                if (jReg.test(iKey)) {
                                                    value = this.mock(schema.patternProperties![j], _options);
                                                    break
                                                }
                                            }
                                        }

                                        if (value === undefined) {
                                            if (ArrayUtil.isObjectNotArray(schema.additionalProperties)) {
                                                value = this.mock(<SchemaExt>schema.additionalProperties, options);
                                            }
                                            else if (schema.additionalProperties ?? true) {
                                                value = Random.pick(arr)();
                                            }
                                            else {
                                                debugger;
                                                throw SyntaxError("cannot mock a `object`");
                                            }

                                        }
                                    }
                                    obj[iKey] = value;
                                    counter++;
                                }
                            }
                        }
                        else {
                            debugger;
                            throw new SyntaxError("never");
                        }

                    }
                    result = obj;
                    // console.log(JSON.stringify(result));
                }
                break;


            case "string":
                {
                    function ensureStrLen(str: string, minLen: number, maxLen?: number) {
                        if (minLen > str.length) {
                            str += Random.string(minLen - str.length, (maxLen ?? (minLength + 3)) - str.length);
                        }
                        return str;
                    }

                    let pattern: string | undefined = _options.skipMockAtts.includes('pattren') ? undefined : <string>schema.pattern;
                    let { minLength = 0, maxLength, format } = analysisString(schema);
                    if (pattern !== undefined) {
                        let re: string = Mock.mock(new RegExp(pattern));
                        result = ensureStrLen(re, minLength, maxLength);
                    }
                    else if (format !== undefined) {
                        switch (format) {
                            case "email":
                                {
                                    result = Random.email(Random.domain());
                                    // result = Mock.mock(`@string('lower',1,6)@@string('lower',1,5).@string('lower',2,5)`)
                                    // result = `${Random.string('lower', 1, 6)}@${Random.string('lower', 1, 5)}`
                                }
                                break;
                            case "date":
                                {
                                    result = Random.date();
                                }
                                break;
                            case "time":
                                {
                                    result = Random.time();
                                }
                                break;
                            case "date-time":
                                {
                                    result = `${Random.date()}T${Random.time()}Z`;
                                }
                                break;
                            case "uri":
                            case "url":
                                {
                                    result = Random.url();
                                }
                                break;
                            case "protocol":
                                {
                                    result = Random.protocal();
                                }
                                break;
                            case "domain":
                                {
                                    result = Random.domain();
                                    // result = Mock.mock(`@string('lower',1,5).@string('lower',2,5)`)
                                }
                                break;
                            case "ip":
                                {
                                    result = Random.ip();
                                }
                                break;
                            case "zip":
                                {
                                    result = Random.zip();
                                }
                                break;
                            case "color":
                                {
                                    result = Random.color();
                                }
                                break;
                            case "guid":
                                {
                                    result = Random.guid();
                                }
                                break;
                        }
                    }
                    else {
                        result = Random.string(minLength, maxLength ?? minLength + 5);
                    }
                }

                break;

            case "null":
                result = null;
                break;

            case "number":
                {
                    let { min, max, exMin, exMax, pow, multipleOf, start, end, re } = analysisNumber(schema);
                    if (re !== undefined) {
                        result = re;
                        break;
                    }

                    if (multipleOf !== undefined) {

                        //node.multipleOf是整型，不必担心浮点运算丢失精度
                        const RANGE = 100000;
                        if (start === Number.MIN_SAFE_INTEGER && end === Number.MAX_SAFE_INTEGER) {
                            const gap = Random.integer(-RANGE, RANGE);
                            result = gap * multipleOf;
                        }
                        else if (start === Number.MIN_SAFE_INTEGER) {
                            const gap = Random.integer(0, RANGE);
                            result = end! - gap * multipleOf;
                        }
                        else if (end === Number.MAX_SAFE_INTEGER) {
                            const gap = Random.integer(0, RANGE);
                            result = start! + gap * multipleOf;
                        }
                        else {
                            //never
                            const step = (end! - start!) / multipleOf;
                            const gap = Random.integer(0, step);
                            result = start! + gap * multipleOf;
                        }

                        result /= pow!;

                    }
                    else {
                        //没有`multipleOf`的情况

                        while (true) {
                            result = Random.float(min, max);

                            // mockjs的Random.float生产机制会有机会超出min或max
                            // 修正方法：把result超出range的差值加到min
                            if (result > max!) {
                                result = min! + Math.abs((result % (max! - min!)));
                            }
                            else if (result < min!) {
                                result = max! - Math.abs(result % (max! - min!));
                            }
                            if (exMin && result == min) {
                                continue;
                            }
                            if (exMax && result == max) {
                                continue;
                            }
                            break;
                        }

                    }
                }

                break;

            case "integer":
                {
                    const { min, max } = analysisInteger(schema);
                    result = Random.integer(min, max);
                }
                break;

            case "boolean":
                result = Random.boolean();
                break;
        }

        // console.log(JSON.stringify(result));
        return result;
    }

    /**
     * to create SchemaMock
     * @param schema 
     */
    static async parser(schema: string | SchemaExt): Promise<SchemaMock> {
        if (typeof schema === "string") {
            const name = schema;
            if (this._instances[name])
                return Promise.resolve(this._instances[name]);

            try {
                let str:string;
                if (/^(https?:\/\/)/i.test(name)) {
                    str = await HttpUtil.get(name);
                }
                else
                {
                    str = await fs.readFileSync(name, { encoding: "utf-8" });
                }
                const schema = JSON.parse(str);
                const sm = new SchemaMock(schema);
                return Promise.resolve(sm);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        else if (!Array.isArray(schema) && typeof schema === "object") {
            const sm = new SchemaMock(schema);
            return Promise.resolve(sm);
        }

        return Promise.reject(new SyntaxError("some thing wrong"));

    }
}

export type MockOptions = {
    /**
     * like : "#/a/b/0/c"
     */
    jspath?: string;

    /**
     * the given attributes will not be mock
     */
    skipMockAtts: string[];

    /**
     * if `true`, `object` data will only mock propertis in `required`
     */
    requiredOnly: boolean;
}

export type Schema = SchemaExt
