import { Order, SortConfig, SortOption, SortState, StkTableColumn, UniqKey } from '../types';

/** 是否空值 */
export declare function isEmptyValue(val: any, isNumber?: boolean): boolean;
/**
 * 对有序数组插入新数据
 */
export declare function insertToOrderedArray<T extends object>(sortState: SortState<T>, newItem: T, targetArray: T[], sortConfig?: SortConfig<T> & {
    customCompare?: (a: T, b: T) => number;
}): T[];
/**
 * 二分查找
 */
export declare function binarySearch(searchArray: any[], compareCallback: (midIndex: number) => number): number;
/**
 * 字符串比较
 */
export declare function strCompare(a: string, b: string, isNumber: boolean, localeCompare?: boolean): number;
/**
 * 表格排序
 */
export declare function tableSort<T extends Record<string, any>>(sortOption: SortOption<T>, order: Order, dataSource: T[], sortConfig?: SortConfig<T>): T[];
/** 多级表头深度 */
export declare function howDeepTheHeader(arr: StkTableColumn<any>[], level?: number): number;
/** number width +px */
export declare function transformWidthToStr(width?: string | number): string | undefined;
export declare function getBrowsersVersion(browserName: string): number;
export declare function pureCellKeyGen(rowKey: UniqKey, colKey: UniqKey): string;
export declare function getClosestTr(target: HTMLElement): HTMLTableRowElement | null;
export declare function getClosestTh(target: HTMLElement): HTMLTableCellElement | null;
export declare function getClosestTd(target: HTMLElement): HTMLTableCellElement | null;
export declare function getClosestTrIndex(target: HTMLElement): number;
export declare function getClosestColKey(target: HTMLElement): string | undefined;
/**
 * 改进的节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * requestAnimationFrame-based throttle
 */
export declare function rafThrottle<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void;
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
