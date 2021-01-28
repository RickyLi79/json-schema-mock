import {SchemaMock } from "json-schema-mock";

/**
 * //# my.schema.json
    {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "required": [
            "a",
            "b"
        ],
        "additionalProperties": false,
        "properties": {
            "a": {
                "type": "boolean"
            },
            "b": {
                "type": "integer"
            },
            "c": {
                "type": "number"
            }
        }
    }
 */
const file = "my.schema.json";
// const file = "https://host/my.schema.json";

SchemaMock.parser(file).then( (schemaMock)=>{
    const data = schemaMock.mock();
    console.log(JSON.stringify(data)); // => { a:true, b:531, c:42.11 }
} );

