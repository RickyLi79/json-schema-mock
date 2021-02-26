# @rickyli79/json-schema-mock
[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
![NPM](https://img.shields.io/npm/l/@rickyli79/json-schema-mock?style=flat-square)

[npm-image]: https://img.shields.io/npm/v/@rickyli79/json-schema-mock.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@rickyli79/json-schema-mock
[download-image]: https://img.shields.io/npm/dm/@rickyli79/json-schema-mock.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rickyli79/json-schema-mock

简体中文 | [English](./README.md)

---


根据给定的[JSON Schema](http://json-schema.org/understanding-json-schema/index.html)生成json

## 特色

- 在给定规则内，尽可能丰富地在生成数据
- 过滤肯定冲突的规则，智能寻找不会发生冲突的规则进行数据生成
- 生成支持的完整列表参看[Test List](./TestList.md)

## DEMO
- https://rickyli79.github.io/json-schema-mock/
- https://rickyli79.gitee.io/json-schema-mock/

## 安装
```shell
$ npm install @rickyli79/json-schema-mock
```

## 使用方法

```typescript
import {SchemaMock, Schema } from "json-schema-mock";
const schema: Schema = { type:"string" , minLength:1, maxLength:5 }; 

SchemaMock.parser(schema).then( (schemaMock)=>{
    const data = schemaMock.mock();
    console.log(JSON.stringify(data));
} );
```

## 示例
- [examples/byFileOrUrl.ts](examples/byFileOrUrl.ts)
- [examples/bySchema.ts](examples/bySchema.ts)

## 不支持 & BUG
- 不支持 `$id` and `$ref` 
- 不支持  `not`
- BUG : `oneOf`生成的数据无法保证排它性校验通过
- BUG : `additionalProperties` in `allOf` 生成的数据无法保证检验通过
- 瑕疵：`anyOf` and `oneOf` 仅会在第一次选择可能性分支，其后一直采用当分支进行数据生成

## 第三方类库

- JSON校验使用 [ tdegrunt/jsonschema ](https://github.com/tdegrunt/jsonschema)
- 基本数据类型mock使用 [ Mock.js ](https://github.com/nuysoft/Mock)

## licenses
[MIT](https://github.com/nuysoft/Mock/blob/master/LICENSE)

