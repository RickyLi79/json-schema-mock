"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_mock_1 = require("json-schema-mock");
let schema = {
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
};
const result = [];
for (let i = 0; i < 10; i++) {
    const iResult = json_schema_mock_1.SchemaMock.mock(schema);
    result.push(iResult);
    console.log(JSON.stringify(iResult));
}
