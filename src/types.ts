import { Schema } from "jsonschema";
import { AnalysisIntegerResult } from "./analysis/integer";
import { AnalysisNumberResult } from "./analysis/number";
import { AnalysisStringResult } from "./analysis/string";

export interface SchemaExt extends Schema, AnalysisMark, xMockTest {
    additionalItems?: boolean | SchemaExt
    items?: SchemaExt | SchemaExt[]
    additionalProperties?: boolean | SchemaExt
    definitions?: {
        [name: string]: SchemaExt
    }
    properties?: {
        [name: string]: SchemaExt
    }
    patternProperties?: {
        [name: string]: SchemaExt
    }
    dependencies?: {
        [name: string]: SchemaExt | string[]
    }
    allOf?: SchemaExt[]
    anyOf?: SchemaExt[]
    oneOf?: SchemaExt[]
    not?: SchemaExt
    if?: SchemaExt
    then?: SchemaExt
    else?: SchemaExt

    examples?: any[]
    propertyNames?: SchemaExt | boolean
    required?: string[]

}

export interface xMockTest {
    "x-mock-test"?: {
        repeat?: number,
        assertValidSuccess?: boolean
        assertExecSuccess?: boolean,
        itMode?: number
    };
}

export interface AnalysisMark {
    "x-analysis-mark"?: {
        "allOf"?: boolean;
        "const"?: boolean;
        "enum"?: boolean;
        "examples"?: boolean;
        "integer"?: AnalysisIntegerResult;
        "number"?: AnalysisNumberResult
        "string"?: AnalysisStringResult
        "object"?: AnalysisObjectResult
    }
}

export const AnalysisMarkName = "x-analysis-mark";
export enum AnalysisMarkEnum {
    AllOf = `allOf`,
    Const = `const`,
    Enum = `enum`,
    Examples = `examples`,
    Integer = "integer",
    Number = "number",
    String = "string",
    Object = "object",
}