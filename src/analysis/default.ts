import _ from "lodash";
import jsonschema from "jsonschema";
import { AnalysisMarkEnum, AnalysisMarkName, SchemaExt } from "../types";

//#region resolve schema
export function analysisSchema(orgSchema: SchemaExt, clone: boolean): SchemaExt {
    let schema = clone ? _.cloneDeep(orgSchema) : orgSchema;
    schema[AnalysisMarkName] = schema[AnalysisMarkName] ?? {}
    analysisAllOf(schema);
    analysisConst(schema);
    if (schema.const === undefined) {
        analysisEnum(schema);
        analysisEnum(schema);
    }
    return schema;
}


export function analysisConst(schema: SchemaExt): SchemaExt {
    if (schema[AnalysisMarkEnum.Const] === undefined && schema.const !== undefined) {
        try {
            jsonschema.validate(schema.const, schema, { throwFirst: true });
        }
        catch (err) {
            throw new SyntaxError('conflict with `schema`')
        }
    }
    schema[AnalysisMarkName]![AnalysisMarkEnum.Const] = true;
    return schema;
}

export function analysisEnum(schema: SchemaExt): SchemaExt {
    if (schema[AnalysisMarkEnum.Enum] === undefined && schema[`enum`] !== undefined) {
        let enumArr = schema[`enum`]!;
        let vEnum: any[] = []
        for (let iEnum of enumArr) {
            try {
                jsonschema.validate(iEnum, schema, { throwFirst: true });
                vEnum.push(iEnum);
            }
            catch (e) {
            }
        }
        if (vEnum.length === 0) {
            throw new SyntaxError('enum array has too few items. Expected 1 or more.')
        }
        schema[`enum`] = vEnum;
    }
    schema[AnalysisMarkName]![AnalysisMarkEnum.Enum] = true;
    return schema;
}

export function analysisExamples(schema: SchemaExt): SchemaExt {
    if (schema[AnalysisMarkEnum.Examples] === undefined && schema !== undefined) {
        let enumArr = schema[`enum`]!;
        let vEnum: any[] = []
        for (let iEnum of enumArr) {
            try {
                jsonschema.validate(iEnum, schema, { throwFirst: true });
                vEnum.push(iEnum);
            }
            catch (e) {
            }
        }
        if (vEnum.length === 0) {
            throw new SyntaxError('enum array has too few items. Expected 1 or more.')
        }
        schema[`enum`] = vEnum;
    }
    schema[AnalysisMarkName]![AnalysisMarkEnum.Enum] = true;
    return schema;
}

export function analysisAllOf(schema: SchemaExt): SchemaExt {
    if (schema[AnalysisMarkEnum.AllOf] === undefined && schema.allOf?.[0]) {
        // let schema = clone ? _.cloneDeep(orgSchema) : orgSchema;
        schema = _.reduce(schema.allOf, (result, iSchema: SchemaExt) => {
            iSchema = analysisAllOf(iSchema);
            return Object.assign(result, iSchema)
        }, schema);
        delete schema.allOf;
    }
    schema[AnalysisMarkName]![AnalysisMarkEnum.AllOf] = true;
    return schema;
}

export function contactAnyOf(schema: SchemaExt): SchemaExt {
    if (schema[AnalysisMarkEnum.AllOf] === undefined && schema.allOf?.[0]) {
        // let schema = clone ? _.cloneDeep(orgSchema) : orgSchema;
        schema = _.reduce(schema.allOf, (result, iSchema: SchemaExt) => {
            iSchema = analysisAllOf(iSchema);
            return Object.assign(result, iSchema)
        }, schema);
        delete schema.allOf;
    }
    schema[AnalysisMarkName]![AnalysisMarkEnum.AllOf] = true;
    return schema;
}

export function contactOneOf(schema: SchemaExt): SchemaExt {
    if (schema[AnalysisMarkEnum.AllOf] === undefined && schema.allOf?.[0]) {
        // let schema = clone ? _.cloneDeep(orgSchema) : orgSchema;
        schema = _.reduce(schema.allOf, (result, iSchema: SchemaExt) => {
            iSchema = analysisAllOf(iSchema);
            return Object.assign(result, iSchema)
        }, schema);
        delete schema.allOf;
    }
    schema[AnalysisMarkName]![AnalysisMarkEnum.AllOf] = true;
    return schema;
}

//#endregion
