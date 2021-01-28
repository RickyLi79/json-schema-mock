import { isArray } from "lodash";
import { LogDelay } from "./LoggerUtil"

type ElemT = string | number | undefined | null;
class ArrayUtilStatic {

    // @LogDelay()
    unique<T extends ElemT>(...arrs: T[][]): T[] {
        let tmp = (<T[]>[]).concat(...arrs);
        let result: T[] = [];
        let map: { [key: string]: true } = {};

        for (let i of tmp) {
            if (!map[<string><unknown>i]) {
                result.push(i);
                map[<string><unknown>i] = true
            }
        }
        return result;
    }


    // @LogDelay()
    intersection<T extends ElemT>(arr1: T[], arr2: T[]): T[] {
        let result: T[] = [];
        for (let i of arr2) {
            if (arr1.includes(i)) {
                result.push(i);
            }
        }
        return result;
    }

    difference<T extends ElemT>(arr1: T[], arr2: T[]): T[] {
        let result: T[] = [...arr1];
        for (let i = result.length - 1; i > -1; i--) {
            if (arr2.includes(result[i])) {
                result.splice(i, 1);
            }
        }
        return result;
    }

    isObjectNotArray(target:any){
        return !Array.isArray(target) && typeof target==="object";
    }

}

export const ArrayUtil = new ArrayUtilStatic()