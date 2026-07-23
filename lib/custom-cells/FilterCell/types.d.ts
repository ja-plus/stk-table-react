import { UniqKey } from '../../types';

/** 筛选选项接口 */
export interface FilterOption {
    label: string;
    value: any;
    selected?: boolean;
}
/** 筛选状态接口 */
export interface FilterStatus {
    value: FilterOption['value'][];
    /**
     * 自定义筛选逻辑函数。
     * 当选中筛选条件时，根据此函数的返回值决定记录是否保留。
     * @param row 当前行数据
     * @param cellValue 当前单元格的值（即 row[columnKey]）
     * @param filterValues 当前选中的筛选值数组
     * @returns 返回 true 保留记录，false 过滤掉
     */
    filter?: (args: {
        row: any;
        cellValue: any;
        filterValues: FilterOption['value'][];
    }) => boolean;
}
/** FilterComponent 配置接口 */
export interface FilterComponentConfig {
    options?: FilterOption[];
    filter?: FilterStatus['filter'];
    /**
     * 是否自动从数据中提取筛选选项，默认 false
     * en: Whether to automatically extract filter options from the data source
     */
    autoOptions?: boolean;
}
/** createFilter选项接口 */
export interface CreateFilterCellOption {
    /** 是否远程筛选 */
    remote?: boolean;
    /** 筛选状态改变时触发 */
    onChange?: (data: {
        colKey: UniqKey;
        status: FilterStatus;
    }) => void;
}
