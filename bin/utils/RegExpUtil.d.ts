declare class RegExpUtilStatic {
    fixPattern(pattern: string): string;
    getMergedReg(reg1: string, reg2: string, testTime?: number): string;
}
export declare const RegExpUtil: RegExpUtilStatic;
export declare enum MergeModeEnum {
    OVERWRITE = 1,
    ADD = 2,
    UNIQUE = 3,
    INTERSECT = 4
}
export {};
