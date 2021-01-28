import {SchemaMock, Schema } from "json-schema-mock";

let schema: Schema = {
    "description": "`items` Tuple validation, `uniqueItems`===`false`",
    "type": "array",
    "minItems": 2,
    "items": [
        {
            "type": "integer",
            "minimum": 0,
            "maximum": 4
        },
        {
            "type": "boolean"
        },
        {
            "type": "string"
        }
    ]
}

const result:any[] = [];
for (let i = 0; i < 10;i++)
{
    const iResult = SchemaMock.mock(schema)
    result.push(iResult);
    console.log(JSON.stringify(iResult));
}