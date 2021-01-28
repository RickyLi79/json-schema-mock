"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaMock = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const jsonschema_1 = __importDefault(require("jsonschema"));
const mockjs_1 = __importStar(require("mockjs"));
const path_1 = __importDefault(require("path"));
const array_1 = require("./analysis/array");
const default_1 = require("./analysis/default");
const integer_1 = require("./analysis/integer");
const number_1 = require("./analysis/number");
const object_1 = require("./analysis/object");
const string_1 = require("./analysis/string");
const ArrayUtil_1 = require("./utils/ArrayUtil");
const RegExpUtil_1 = require("./utils/RegExpUtil");
const mockjs_2 = __importDefault(require("mockjs"));
mockjs_1.Random.tld = function () {
    return this.pick((
    // 域名后缀
    'com net org edu gov int mil cn ' +
        // 国内域名
        'com.cn net.cn gov.cn org.cn ' +
        // 中文国内域名
        // '中国 中国互联.公司 中国互联.网络 ' +
        // 新国际域名
        'tel biz cc tv info name hk mobi asia cd travel pro museum coop aero ' +
        // 世界各国域名后缀
        'ad ae af ag ai al am an ao aq ar as at au aw az ba bb bd be bf bg bh bi bj bm bn bo br bs bt bv bw by bz ca cc cf cg ch ci ck cl cm cn co cq cr cu cv cx cy cz de dj dk dm do dz ec ee eg eh es et ev fi fj fk fm fo fr ga gb gd ge gf gh gi gl gm gn gp gr gt gu gw gy hk hm hn hr ht hu id ie il in io iq ir is it jm jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md mg mh ml mm mn mo mp mq mr ms mt mv mw mx my mz na nc ne nf ng ni nl no np nr nt nu nz om qa pa pe pf pg ph pk pl pm pn pr pt pw py re ro ru rw sa sb sc sd se sg sh si sj sk sl sm sn so sr st su sy sz tc td tf tg th tj tk tm tn to tp tr tt tv tw tz ua ug uk us uy va vc ve vg vn vu wf ws ye yu za zm zr zw').split(' '));
};
class SchemaMock {
    constructor(orgSchema) {
        this._orgSchema = orgSchema;
        this._analysisSchema = lodash_1.default.cloneDeep(orgSchema);
    }
    get schema() {
        return this._orgSchema;
    }
    get analysisSchema() {
        return this._analysisSchema;
    }
    static mockNode(orgSchema, options = {}) {
        var _a, _b, _c, _d, _e, _f, _g;
        let schema = default_1.analysisSchema(orgSchema, false);
        let result;
        if (schema.const !== undefined) {
            result = schema.const;
            return result;
        }
        if (schema["x-mock-tpl"] !== undefined) {
            const re = mockjs_2.default.mock({ ROOT: schema["x-mock-tpl"] });
            return re.ROOT;
        }
        if (schema.enum !== undefined) {
            let enumIdxArr = [];
            for (let i = schema.enum.length - 1; i > -1; i--) {
                enumIdxArr.unshift(i);
            }
            enumIdxArr = mockjs_1.Random.shuffle(enumIdxArr);
            while (true) {
                let idx = enumIdxArr.pop();
                if (idx === undefined) {
                    throw new SyntaxError("all items in `enum` invalid");
                }
                try {
                    result = schema.enum[idx];
                    jsonschema_1.default.validate(schema.enum[idx], schema, { throwFirst: true });
                    break;
                }
                catch (err) {
                }
            }
            return result;
        }
        const _options = Object.assign({
            skipMockAtts: [], requiredOnly: false
        }, options);
        const type = Array.isArray(schema.type) ? mockjs_1.Random.pick(schema.type) : (_a = schema.type) !== null && _a !== void 0 ? _a : mockjs_1.Random.pick(object_1.TypesToRandom);
        switch (type) {
            case undefined:
                result = mockjs_1.Random.pick(object_1.RandomTypeArr)();
                break;
            case "array":
                {
                    let arr = [];
                    let { min, max, uniqueItems, itemTuple, items, allowAdditional, additionalItems, containsArr } = array_1.analysisArray(schema);
                    const maxCounter = mockjs_1.Random.integer(min, max);
                    let containsAllDone = containsArr.length === 0;
                    let containsDone = [];
                    for (let i = 1; i <= maxCounter || !containsAllDone; i++) {
                        //#region 
                        // let iItem = Random.pick(RandomTypeArr)();
                        let iSchema;
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
                                }
                                else {
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
                            }
                            else {
                                iSchema = items[0];
                            }
                        }
                        if (iSchema === undefined && !allowAdditional)
                            break;
                        let iItem;
                        if (iSchema === undefined) {
                            iItem = mockjs_1.Random.pick(object_1.RandomTypeArr)();
                        }
                        else {
                            iItem = this.mockNode(iSchema);
                        }
                        //#endregion
                        if (uniqueItems) {
                            let toBreak = false;
                            let toContinue = false;
                            let arrLen = arr.length;
                            for (let jItem of arr) {
                                if (lodash_1.default.isEqual(iItem, jItem)) {
                                    if (arrLen >= min) {
                                        toBreak = true;
                                        break;
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
                                    const validResult = jsonschema_1.default.validate(iItem, containsArr[j]);
                                    if (validResult.errors.length === 0) {
                                        containsDone[j] = true;
                                        remain--;
                                    }
                                }
                                else {
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
                    let obj = {};
                    let { min, max, required, requiredLen, allowKeys, allowAdditional, keyPatterns, allowPattern, depkeys, depSchemas } = object_1.analysisObject(schema);
                    if (_options.requiredOnly) {
                        min = max = requiredLen;
                    }
                    if (schema.properties === undefined
                        && schema.patternProperties === undefined
                        && (schema.propertyNames === undefined || schema.propertyNames === true)
                        && !ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.additionalProperties)
                        && schema.dependencies === undefined) {
                        const maxCounter = mockjs_1.Random.integer(min, max !== null && max !== void 0 ? max : min + 5);
                        const arr = object_1.RandomTypeArr;
                        for (let counter = 1; counter <= maxCounter; counter++) {
                            const key = (_b = required[counter - 1]) !== null && _b !== void 0 ? _b : (mockjs_1.Random.string(1, 4) + counter);
                            const value = mockjs_1.Random.pick(arr)();
                            obj[key] = value;
                        }
                    }
                    else {
                        const maxCounter = allowAdditional ? mockjs_1.Random.integer(min, max !== null && max !== void 0 ? max : min + 5) : Math.min(max !== null && max !== void 0 ? max : min + 5, requiredLen + allowKeys.length);
                        schema.properties = (_c = schema.properties) !== null && _c !== void 0 ? _c : (allowKeys.length > 0 ? {} : (allowPattern ? {} : undefined));
                        if (schema.properties !== undefined) {
                            allowKeys = [...allowKeys];
                            const properties = schema.properties;
                            const arr = object_1.RandomTypeArr;
                            const tmpReg = {};
                            // const maxTryTimes = keyPatterns.length * 2 + allowKeys.length;
                            if (allowAdditional)
                                allowKeys = mockjs_1.Random.shuffle(allowKeys);
                            for (let counter = 1; counter <= maxCounter;) {
                                let key = required[counter - 1];
                                // let keysDep: string[] = [key];
                                let keysDep = [...((_d = depkeys[key]) !== null && _d !== void 0 ? _d : [key])];
                                if (key === undefined) {
                                    let tryTimes = 0;
                                    let useAllowKey;
                                    function genAllowKey() {
                                        useAllowKey = true;
                                        return allowKeys[0];
                                    }
                                    function genPatternKey() {
                                        let p = mockjs_1.Random.pick(keyPatterns);
                                        p = RegExpUtil_1.RegExpUtil.fixPattern(p);
                                        tmpReg[p] = new RegExp(p);
                                        return mockjs_1.default.mock(tmpReg[p]);
                                    }
                                    do {
                                        useAllowKey = false;
                                        if (!allowAdditional && keyPatterns.length == 0 && allowKeys.length == 0) {
                                            debugger;
                                            throw new SyntaxError("cannot mock a `property name`");
                                        }
                                        else if (allowAdditional && ((keyPatterns.length == 0 && allowKeys.length == 0))) {
                                            key = (mockjs_1.Random.string(1, 4) + counter);
                                        }
                                        else if (keyPatterns.length == 0 && allowKeys.length > 0) {
                                            key = genAllowKey();
                                        }
                                        else if (allowPattern && keyPatterns.length > 0 && allowKeys.length == 0) {
                                            key = genPatternKey();
                                        }
                                        else {
                                            key = mockjs_1.Random.boolean() ? genAllowKey() : genPatternKey();
                                        }
                                        tryTimes++;
                                        keysDep = [key];
                                        if (obj[key] === undefined) {
                                            keysDep = [...((_e = depkeys[key]) !== null && _e !== void 0 ? _e : [key])];
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
                                        }
                                        else {
                                            break;
                                        }
                                    } while (true);
                                    // counter += keysDep.length - 1;
                                    if (useAllowKey) {
                                        for (let iKey of keysDep) {
                                            const idx = allowKeys.indexOf(iKey);
                                            if (idx > -1)
                                                allowKeys.splice(idx, 1);
                                        }
                                    }
                                }
                                // const depValue: { [key: string]: any } = {};
                                for (let iKey of keysDep) {
                                    let value;
                                    if (obj[iKey] !== undefined) {
                                        // value = depValue[iKey];
                                        counter++;
                                        continue;
                                    }
                                    else if (depSchemas[iKey] !== undefined) {
                                        const tmp = this.mockNode(depSchemas[iKey], Object.assign(Object.assign({}, options), { requiredOnly: true }));
                                        Object.assign(obj, tmp);
                                        counter += Object.keys(tmp).length;
                                        break;
                                        // for (let i in tmp) {
                                        //     depValue[i] = tmp[i];
                                        // }
                                    }
                                    else if (properties[iKey] !== undefined) {
                                        value = this.mockNode(properties[iKey], options);
                                    }
                                    else {
                                        if (allowPattern && keyPatterns !== undefined) {
                                            for (let j in schema.patternProperties) {
                                                const jReg = (_f = tmpReg[j]) !== null && _f !== void 0 ? _f : (tmpReg[j] = new RegExp(j));
                                                if (jReg.test(iKey)) {
                                                    value = this.mockNode(schema.patternProperties[j], _options);
                                                    break;
                                                }
                                            }
                                        }
                                        if (value === undefined) {
                                            if (ArrayUtil_1.ArrayUtil.isObjectNotArray(schema.additionalProperties)) {
                                                value = this.mockNode(schema.additionalProperties, options);
                                            }
                                            else if ((_g = schema.additionalProperties) !== null && _g !== void 0 ? _g : true) {
                                                value = mockjs_1.Random.pick(arr)();
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
                    function ensureStrLen(str, minLen, maxLen) {
                        if (minLen > str.length) {
                            str += mockjs_1.Random.string(minLen - str.length, (maxLen !== null && maxLen !== void 0 ? maxLen : (minLength + 3)) - str.length);
                        }
                        return str;
                    }
                    let pattern = _options.skipMockAtts.includes('pattren') ? undefined : schema.pattern;
                    let { minLength = 0, maxLength, format } = string_1.analysisString(schema);
                    if (pattern !== undefined) {
                        let re = mockjs_1.default.mock(new RegExp(pattern));
                        result = ensureStrLen(re, minLength, maxLength);
                    }
                    else if (format !== undefined) {
                        switch (format) {
                            case "email":
                                {
                                    result = mockjs_1.Random.email(mockjs_1.Random.domain());
                                    // result = Mock.mock(`@string('lower',1,6)@@string('lower',1,5).@string('lower',2,5)`)
                                    // result = `${Random.string('lower', 1, 6)}@${Random.string('lower', 1, 5)}`
                                }
                                break;
                            case "date":
                                {
                                    result = mockjs_1.Random.date();
                                }
                                break;
                            case "time":
                                {
                                    result = mockjs_1.Random.time();
                                }
                                break;
                            case "date-time":
                                {
                                    result = `${mockjs_1.Random.date()}T${mockjs_1.Random.time()}Z`;
                                }
                                break;
                            case "uri":
                            case "url":
                                {
                                    result = mockjs_1.Random.url();
                                }
                                break;
                            case "protocol":
                                {
                                    result = mockjs_1.Random.protocal();
                                }
                                break;
                            case "domain":
                                {
                                    result = mockjs_1.Random.domain();
                                    // result = Mock.mock(`@string('lower',1,5).@string('lower',2,5)`)
                                }
                                break;
                            case "ip":
                                {
                                    result = mockjs_1.Random.ip();
                                }
                                break;
                            case "zip":
                                {
                                    result = mockjs_1.Random.zip();
                                }
                                break;
                            case "color":
                                {
                                    result = mockjs_1.Random.color();
                                }
                                break;
                            case "guid":
                                {
                                    result = mockjs_1.Random.guid();
                                }
                                break;
                        }
                    }
                    else {
                        result = mockjs_1.Random.string(minLength, maxLength !== null && maxLength !== void 0 ? maxLength : minLength + 5);
                    }
                }
                break;
            case "null":
                result = null;
                break;
            case "number":
                {
                    let { min, max, exMin, exMax, pow, multipleOf, start, end, re } = number_1.analysisNumber(schema);
                    if (re !== undefined) {
                        result = re;
                        break;
                    }
                    if (multipleOf !== undefined) {
                        //node.multipleOf是整型，不必担心浮点运算丢失精度
                        const RANGE = 100000;
                        if (start === Number.MIN_SAFE_INTEGER && end === Number.MAX_SAFE_INTEGER) {
                            const gap = mockjs_1.Random.integer(-RANGE, RANGE);
                            result = gap * multipleOf;
                        }
                        else if (start === Number.MIN_SAFE_INTEGER) {
                            const gap = mockjs_1.Random.integer(0, RANGE);
                            result = end - gap * multipleOf;
                        }
                        else if (end === Number.MAX_SAFE_INTEGER) {
                            const gap = mockjs_1.Random.integer(0, RANGE);
                            result = start + gap * multipleOf;
                        }
                        else {
                            //never
                            const step = (end - start) / multipleOf;
                            const gap = mockjs_1.Random.integer(0, step);
                            result = start + gap * multipleOf;
                        }
                        result /= pow;
                    }
                    else {
                        //没有`multipleOf`的情况
                        while (true) {
                            result = mockjs_1.Random.float(min, max);
                            // mockjs的Random.float生产机制会有机会超出min或max
                            // 修正方法：把result超出range的差值加到min
                            if (result > max) {
                                result = min + Math.abs((result % (max - min)));
                            }
                            else if (result < min) {
                                result = max - Math.abs(result % (max - min));
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
                    const { min, max } = integer_1.analysisInteger(schema);
                    result = mockjs_1.Random.integer(min, max);
                }
                break;
            case "boolean":
                result = mockjs_1.Random.boolean();
                break;
        }
        // console.log(JSON.stringify(result));
        return result;
    }
    static parser(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = path_1.default.join(process.cwd(), file);
            if (this._instances[name])
                return Promise.resolve(this._instances[name]);
            const str = fs_1.default.readFileSync(path_1.default.join(process.cwd(), file), "utf-8");
            // this._sv.schemas[name] = JSON.parse(str);
            // new jsonschema.Validator().addSchema();
            try {
                const schema = JSON.parse(str);
                const sm = new SchemaMock(schema);
                return Promise.resolve(sm);
            }
            catch (err) {
                console.error(err);
                return Promise.reject(err);
            }
        });
    }
}
exports.SchemaMock = SchemaMock;
SchemaMock._instances = {};
