简体中文 | [English](./README.md)

# JSON Schema Mock

根据给定的[JSON Schema draft 7](http://json-schema.org/understanding-json-schema/index.html)生成json

## 特色

- 在给定规则内，尽可能丰富地在生成数据
- 过滤肯定冲突的规则，智能寻找不会发生冲突的规则进行数据生成
- 生成支持的完整列表参看[Test List](./TestList.md)

## 安装
```shell
# Gitee码云
$ npm install https://gitee.com/RickyLi79/json-schema-mock.git
```

```shell
# github
$ npm install https://github.com/RickyLi79/json-schema-mock.git
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

- 示例
    - [./examples/byFileOrUrl.ts](./examples/byFileOrUrl.ts)
    - [./examples/bySchema.ts](./examples/bySchema.ts)

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

