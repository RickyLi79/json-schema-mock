import { Schema } from "jsonschema";
import { AnalysisArrayResult } from "./analysis/array";
import { AnalysisIntegerResult } from "./analysis/integer";
import { AnalysisNumberResult } from "./analysis/number";
import { AnalysisObjectResult } from "./analysis/object";
import { AnalysisStringResult } from "./analysis/string";
export interface SchemaExt extends Schema, AnalysisMark, xMockTest, xMockTpl {
    additionalItems?: boolean | SchemaExt;
    items?: SchemaExt | SchemaExt[];
    additionalProperties?: boolean | SchemaExt;
    definitions?: {
        [name: string]: SchemaExt;
    };
    properties?: {
        [name: string]: SchemaExt;
    };
    patternProperties?: {
        [name: string]: SchemaExt;
    };
    dependencies?: {
        [name: string]: SchemaExt | string[];
    };
    allOf?: SchemaExt[];
    anyOf?: SchemaExt[];
    oneOf?: SchemaExt[];
    not?: SchemaExt;
    if?: SchemaExt;
    then?: SchemaExt;
    else?: SchemaExt;
    examples?: any[];
    propertyNames?: SchemaExt | boolean;
    required?: string[];
    pattern?: string;
    contains?: SchemaExt | boolean;
}
export interface xMockTpl {
    "x-mock-tpl"?: any;
}
export interface xMockTest {
    "x-mock-test"?: {
        repeat?: number;
        assertValidSuccess?: boolean;
        assertExecSuccess?: boolean;
        itMode?: number;
    };
}
export interface AnalysisMark {
    "x-analysis-mark"?: {
        "allOf"?: boolean;
        "anyOf"?: boolean;
        "oneOf"?: boolean;
        "const"?: boolean;
        "enum"?: boolean;
        "examples"?: boolean;
        "integer"?: AnalysisIntegerResult;
        "number"?: AnalysisNumberResult;
        "string"?: AnalysisStringResult;
        "object"?: AnalysisObjectResult;
        "array"?: AnalysisArrayResult;
    };
    "x-merge-mark"?: {
        "anyOf"?: {
            [key: string]: boolean;
        };
        "oneOf"?: {
            [key: string]: boolean;
        };
    };
}
export declare const MergeMarkName = "x-merge-mark";
export declare const AnalysisMarkName = "x-analysis-mark";
export declare enum AnalysisMarkEnum {
    AllOf = "allOf",
    OneOf = "oneOf",
    AnyOf = "anyOf",
    Const = "const",
    Enum = "enum",
    Examples = "examples",
    Integer = "integer",
    Number = "number",
    String = "string",
    Object = "object",
    Array = "array"
}
