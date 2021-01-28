import { AssertionError } from "assert";
import jsonschema from "jsonschema";
import _ from "lodash";
import { SchemaMock } from "../src";
import { SchemaExt } from "../src/types";

class NodeTestStoreStatic {

    ms?: SchemaMock;

    async getSchemaMock() {
        this.ms = await SchemaMock.parser('test/test.schema.json');
        return this.ms;
    }

    ltEach(node: { [name: string]: SchemaExt }, options?: Partial<MockNodeGltOptions>) {
        let _option: MockNodeGltOptions = { repeat: 1000, assertValidSuccess: true, assertExecSuccess: true, skipValidAtts: [], skipMockAtts: [], itMode: 0 };
        Object.assign(_option, options ?? {});
        for (let key in node) {
            let schema: any = node[key];

            let label = schema.description;
            const opt: MockNodeGltOptions = Object.assign({}, _option, schema['x-mock-test'] ?? {});
            if (opt.repeat < 0) {
                opt.repeat = options?.repeat ?? 1;
            }
            this.lt(label, () => schema, opt);
        }
    }

    lt(label: string, schemaFunc: () => SchemaExt | undefined, options?: Partial<MockNodeGltOptions>) {
        const _options: MockNodeGltOptions = Object.assign({
            repeat: 1, assertValidSuccess: true, assertExecSuccess: true, skipValidAtts: [], skipMockAtts: [], itMode: 0
        }, options)
        let _it = [it, it.skip, it.only][_options.itMode] ?? it
        return _it(label, async (done) => {
            // console.group(label);
            const schema = schemaFunc();
            if (schema === undefined) {
                done?.()
                // console.groupEnd();
                return;
            }
            const orgSchema = _.cloneDeep(schema);
            try {
                for (let i = 0; i < _options.repeat; i++) {
                    const re = SchemaMock.mockNode(schema!, { skipMockAtts: _options.skipMockAtts });
                    if (re === undefined) {
                        throw new AssertionError({
                            message: `[#${i}] ${re}`,
                            expected: "not unidefined",
                            actual: re
                        })
                    }
                    const validateResult = jsonschema.validate(re, orgSchema,
                        {
                            skipAttributes: _options.skipValidAtts,
                            throwError: false
                        });
                    const success = validateResult.errors.length == 0;
                    if (_options.assertValidSuccess && !success) {
                        // console.error(`[${i}] : ${re} => ${validateResult.errors.length}`)
                        const err = validateResult.errors[0];
                        throw new AssertionError({
                            message: `[#${i}] ${err.instance} ${err.message}`,
                            stackStartFn: () => { return err.stack },
                            expected: err.schema,
                            actual: err.instance
                        })
                    } else if (!_options.assertValidSuccess && success) {
                        throw new AssertionError({
                            expected: orgSchema,
                            actual: re
                        })
                    }
                }
                done?.(_options.assertExecSuccess ? undefined : new AssertionError({
                    expected: "exec FAILED",
                    actual: "exec SUCCESS",
                }));
            } catch (err) {
                // throw err;
                done?.(_options.assertExecSuccess ? err : undefined);
            }
            finally {
                // console.groupEnd();
            }

        })
    };
}
export const NodeTestStore = new NodeTestStoreStatic();

export type MockNodeGltOptions = {
    repeat: number,
    assertValidSuccess: boolean,
    assertExecSuccess: boolean,
    skipValidAtts: string[],
    skipMockAtts: string[],
    itMode: number
}