"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtil = void 0;
class ArrayUtilStatic {
    // @LogDelay()
    unique(...arrs) {
        let tmp = [].concat(...arrs);
        let result = [];
        let map = {};
        for (let i of tmp) {
            if (!map[i]) {
                result.push(i);
                map[i] = true;
            }
        }
        return result;
    }
    // @LogDelay()
    intersection(arr1, arr2) {
        let result = [];
        for (let i of arr2) {
            if (arr1.includes(i)) {
                result.push(i);
            }
        }
        return result;
    }
    difference(arr1, arr2) {
        let result = [...arr1];
        for (let i = result.length - 1; i > -1; i--) {
            if (arr2.includes(result[i])) {
                result.splice(i, 1);
            }
        }
        return result;
    }
    isObjectNotArray(target) {
        return !Array.isArray(target) && typeof target === "object";
    }
}
exports.ArrayUtil = new ArrayUtilStatic();
