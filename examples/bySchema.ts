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

SchemaMock.parser(schema).then( (schemaMock)=>{
    const data = schemaMock.mock();
    console.log(JSON.stringify(data));
} );

