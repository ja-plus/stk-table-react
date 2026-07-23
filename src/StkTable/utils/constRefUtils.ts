import { DEFAULT_COL_WIDTH, STK_ID_PREFIX } from '../const';
import { PrivateStkTableColumn, StkTableColumn } from '../types';

/**
 * 获取列宽
 */
export function getColWidth(col: StkTableColumn<any>): number {
    const val = col.minWidth ?? col.width ?? DEFAULT_COL_WIDTH;
    if (typeof val === 'number') {
        return Math.floor(val);
    }
    return parseInt(val);
}

/** 获取计算后的宽度 */
export function getCalculatedColWidth(col: PrivateStkTableColumn<any> | null) {
    return col?.__W__ || DEFAULT_COL_WIDTH;
}

/** 创建组件唯一标识 */
export function createStkTableId() {
    let id = (window as any).__STK_TB_ID_COUNT__;
    if (!id) id = 0;
    id += 1;
    (window as any).__STK_TB_ID_COUNT__ = id;
    return STK_ID_PREFIX + id.toString(36);
}
