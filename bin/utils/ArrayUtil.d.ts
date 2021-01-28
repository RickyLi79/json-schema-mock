declare type ElemT = string | number | undefined | null;
declare class ArrayUtilStatic {
    unique<T extends ElemT>(...arrs: T[][]): T[];
    intersection<T extends ElemT>(arr1: T[], arr2: T[]): T[];
    difference<T extends ElemT>(arr1: T[], arr2: T[]): T[];
    isObjectNotArray(target: any): boolean;
}
export declare const ArrayUtil: ArrayUtilStatic;
export {};
