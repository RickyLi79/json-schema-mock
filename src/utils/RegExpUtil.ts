import { mock } from "mockjs";

class RegExpUtilStatic {

    fixPattern(pattern: string) {
        if (!(pattern.startsWith("^") && pattern.endsWith("$"))) {
            if (!pattern.endsWith("$"))
                pattern += ".+?";
            else if (!pattern.startsWith("^")) {
                pattern = ".+?" + pattern;
            }
        }
        return pattern;
    }

    getMergedReg(reg1: string, reg2: string, testTime: number = 1000): string {

        if (reg1 === undefined || reg1 === "")
            return reg2;
        if (reg2 === undefined || reg2 === "")
            return reg1;
    
        if (reg1.indexOf(reg2) > -1)
            return reg1;
    
        if (reg2.indexOf(reg1))
            return reg2;
    
        let r1 = new RegExp(reg1);
        let r2 = new RegExp(reg2);
        let failed1 = false;
        let failed2 = false;
        for (let i = 0; i < testTime; i++) {
            if (!failed1) {
                const str = mock(r1);
                if (!r2.test(str)) {
                    failed1 = true;
                }
            }
            if (!failed2) {
                const str = mock(r2);
                if (!r1.test(str)) {
                    failed2 = true;
                }
            }
            if (failed1 && failed2)
                break;
        }
        if (!failed1)
            return reg1;
        else if (!failed2)
            return reg2;
        else
            return `${reg1}(.+)?${reg2}`;
    }
    
}
export const RegExpUtil = new RegExpUtilStatic();

export enum MergeModeEnum {
    OVERWRITE = 1,
    ADD = 2,
    UNIQUE = 3,
    INTERSECT = 4,
}