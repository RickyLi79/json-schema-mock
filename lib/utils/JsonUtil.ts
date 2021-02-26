export class JsonUtilStatic {

    /**
     * get the data by jspath
     * @param data root data
     * @param jspath like : "#/a/b/2/d"
     */
    getValueByJSPath(data: any, jspath: string): any {
        if ( jspath===undefined || !jspath.startsWith("#/") || jspath === "#/")
            return data;

        const arr = jspath.substr(2).split("/");
        let obj = data;
        for (let iPath of arr) {
            obj = obj[iPath];
            if (obj===undefined)
                break;
        }
        return obj;
    }

}

export const JsonUtil = new JsonUtilStatic();