import fs from "fs";
import _ from "lodash";
import Mock, { Random } from "mockjs";
import path from "path";
import { analysisSchema } from "./analysis/default";
import { analysisInteger } from "./analysis/integer";
import { analysisNumber } from "./analysis/number";
import { analysisString } from "./analysis/string";
import { SchemaExt } from "./types";

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
    public get schema() {
        return this._orgSchema;
    }
    public get analysisSchema() {
        return this._analysisSchema;
    }

    protected _analysisSchema: SchemaExt;

    protected constructor(orgSchema: SchemaExt) {
        this._orgSchema = orgSchema;
        this._analysisSchema = _.cloneDeep(orgSchema);
    }

    mock(): any {
        // const execSchema = this.getSchema(schema)
        // let result = this.mockNode(execSchema)
        // return result
    }

    static mockNode(orgSchema: SchemaExt, options: Partial<MockOptions> = {}): any {
        let schema = analysisSchema(orgSchema, false);
        let result: any
        if (schema.enum !== undefined) {
            if (schema.enum.length === 1) {
                result = schema.enum[0];
            }
            else {
                result = Random.pick(schema.enum)
            }
            return result;
        }

        const _options: MockOptions = Object.assign(
            {
                skipMockAtts: []
            }, options);

        const type = _.isArray(schema) ? _.first(schema.type) : schema.type;

        switch (type) {
            case "array":
                break;

            case "object":
                {
                    let obj: { [key: string]: any } = {};
                    let min = schema.minProperties ?? 0;
                    let max = schema.maxProperties ?? min + 10;
                    let required = schema.required ?? [];
                    min = Math.max(min, required.length);
                    if (max < min) {
                        throw SyntaxError(`size range setting ERROR`)
                    }
                    if (
                        schema.properties === undefined
                        && schema.patternProperties === undefined
                        && (schema.propertyNames === undefined || schema.propertyNames === true)
                        && typeof schema.additionalProperties !== 'object'
                    ) {
                        const maxCounter = Random.integer(min, max);
                        const arr = [() => Random.string(), () => Random.boolean(), () => Random.integer(), () => Random.float(), () => Random.datetime()];
                        for (let counter = 1; counter <= maxCounter; counter++) {
                            const key = required[counter - 1] ?? (Random.string(1, 4) + counter);
                            const value = Random.pick(arr)()
                            obj[key] = value;
                        }
                        // console.log(maxCounter, JSON.stringify(obj))
                    } else if (1) {

                    }
                    result = obj;
                }
                break;


            case "string":
                {
                    function ensureStrLen(str: string, minLen: number, maxLen: number) {
                        if (minLen > str.length) {
                            str += Random.string('', minLen - str.length, maxLen - minLength - str.length);
                        }
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
                        result = Random.string(minLength, maxLength);
                    }
                }



                break;

            case "null":
                result = null
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
                            if (result > max! || result < min!) {
                                result = min! + (result % (max! - min!));
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
        return result
    }

    static async parser(file: string): Promise<SchemaMock> {
        const name = path.join(process.cwd(), file);

        if (this._instances[name])
            return Promise.resolve(this._instances[name])

        const str = fs.readFileSync(path.join(process.cwd(), file), "utf-8");
        // this._sv.schemas[name] = JSON.parse(str);
        // new jsonschema.Validator().addSchema();
        const schema = JSON.parse(str);
        const sm = new SchemaMock(schema);
        return Promise.resolve(sm);

    }
}

export type MockOptions = {
    skipMockAtts: string[]
}

