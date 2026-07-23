import { default as React, ComponentType } from 'react';
import { CustomHeaderCellProps, UniqKey } from '../../types';
import { CreateFilterCellOption, FilterComponentConfig, FilterOption, FilterStatus } from './types';

export type { CreateFilterCellOption, FilterComponentConfig, FilterOption, FilterStatus };
/**
 * 表格筛选功能工厂函数 (BETA)
 *
 * 通过 StkTableContext 获取所在表格的 dataSource / theme / setFilter。
 * @beta
 * @returns
 */
export declare function createFilterCell(option?: CreateFilterCellOption): {
    Filter: (config?: FilterComponentConfig, component?: ComponentType<CustomHeaderCellProps<any>>) => {
        (props: CustomHeaderCellProps<any>): React.JSX.Element;
        displayName: string;
    };
    filterStatus: {
        current: Record<UniqKey, FilterStatus>;
    };
};
