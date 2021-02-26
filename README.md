# @rickyli79/json-schema-mock
[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
![NPM](https://img.shields.io/npm/l/@rickyli79/json-schema-mock?style=flat-square)

[npm-image]: https://img.shields.io/npm/v/@rickyli79/json-schema-mock.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@rickyli79/json-schema-mock
[download-image]: https://img.shields.io/npm/dm/@rickyli79/json-schema-mock.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rickyli79/json-schema-mock

English | [简体中文](./README.zh-CN.md)

---

Generate data base on given [JSON Schema](http://json-schema.org/understanding-json-schema/index.html)

## Features

- As rich as possible, generate data base on schema
- Analyze and filter the impossible rules. 
- View full test list : [Test List](./TestList.md)

## DEMO
- https://rickyli79.github.io/json-schema-mock/
- https://rickyli79.gitee.io/json-schema-mock/

## Install
```shell
$ npm install @rickyli79/json-schema-mock
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

