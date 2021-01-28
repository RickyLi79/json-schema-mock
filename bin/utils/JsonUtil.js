"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonUtil = exports.JsonUtilStatic = void 0;
class JsonUtilStatic {
    /**
     * get the data by jspath
     * @param data root data
     * @param jspath like : "#/a/b/2/d"
     */
    getValueByJSPath(data, jspath) {
        if (jspath === undefined || !jspath.startsWith("#/") || jspath === "#/")
            return data;
        const arr = jspath.substr(2).split("/");
        let obj = data;
        for (let iPath of arr) {
            obj = obj[iPath];
            if (obj === undefined)
                break;
        }
        return obj;
    }
}
exports.JsonUtilStatic = JsonUtilStatic;
exports.JsonUtil = new JsonUtilStatic();
