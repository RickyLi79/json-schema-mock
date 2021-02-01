English | [简体中文](./README.zh-CN.md)

# JSON Schema Mock

Generate data base on given [JSON Schema draft 7](http://json-schema.org/understanding-json-schema/index.html)

## Features

- As rich as possible, generate data base on schema
- Analyze and filter the impossible rules. 
- View full test list : [Test List](./TestList.md)

## DEMO
- https://rickyli79.github.io/json-schema-mock/
- https://rickyli79.gitee.io/json-schema-mock/

## Install
```shell
# Gitee码云
$ npm install https://gitee.com/RickyLi79/json-schema-mock.git
```

```shell
# github
$ npm install https://github.com/RickyLi79/json-schema-mock.git
```

## Usage

```typescript
import {SchemaMock, Schema } from "json-schema-mock";
const schema: Schema = { type:"string" , minLength:1, maxLength:5 }; 

SchemaMock.parser(schema).then( (schemaMock)=>{
    const data = schemaMock.mock();
    console.log(JSON.stringify(data));
} );
```

## Usage Examples
- [examples/byFileOrUrl.ts](examples/byFileOrUrl.ts)
- [examples/bySchema.ts](examples/bySchema.ts)
    

## Not support & BUG
- Not support `$id` and `$ref`
- Not support `not`
- BUG : mock data by `oneOf` may cannot valid by schema
- BUG : mock data by `additionalProperties` in `allOf` may cannot valid by schema
- FLAW : `anyOf` and `oneOf` will randomly use first aviable subSchema to generate data

## Dependencies

- JSON validator : [ tdegrunt/jsonschema ](https://github.com/tdegrunt/jsonschema)
- base data type mock : [ Mock.js ](https://github.com/nuysoft/Mock)

## LICENSE
[MIT License](https://github.com/nuysoft/Mock/blob/master/LICENSE)

