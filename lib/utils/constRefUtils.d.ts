import { PrivateStkTableColumn, StkTableColumn } from '../types';

/**
 * 获取列宽
 */
export declare function getColWidth(col: StkTableColumn<any>): number;
/** 获取计算后的宽度 */
export declare function getCalculatedColWidth(col: PrivateStkTableColumn<any> | null): number;
/** 创建组件唯一标识 */
export declare function createStkTableId(): string;
