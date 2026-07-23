import React, { useContext } from 'react';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import type { CustomHeaderCellProps, UniqKey } from '../../types';
import { StkTableContext } from '../../context';
import { getDropdownIns } from './Dropdown';
import type { CreateFilterCellOption, FilterComponentConfig, FilterOption, FilterStatus } from './types';
import './Filter.less';

export type { CreateFilterCellOption, FilterComponentConfig, FilterOption, FilterStatus };

/**
 * 从数据源提取筛选选项
 *
 * @param dataSource 数据源
 * @param columnKey 列名
 * @returns 筛选选项数组
 */
function extractFilterOptions(dataSource: any[], columnKey: string): FilterOption[] {
    const uniqueValues = new Set<any>();

    dataSource.forEach(row => {
        const val = row[columnKey];
        if (val !== undefined && val !== null) {
            uniqueValues.add(val);
        }
    });

    return Array.from(uniqueValues).map(value => ({
        label: String(value),
        value,
    }));
}

type FilterViewProps = CustomHeaderCellProps<any> & {
    theme?: 'light' | 'dark';
    /** 是否激活筛选 */
    active?: boolean;
    /** 懒获取筛选选项，仅在下拉打开时调用 */
    getOptions: () => FilterOption[];
    onChange: (value: FilterOption['value'][]) => void;
    children?: ReactNode;
};

function FilterView(props: FilterViewProps) {
    // 从父组件继承 theme，默认为 'light'
    const theme = props.theme || 'light';

    function handleConfirm(value: FilterOption['value'][]) {
        props.onChange(value);
    }

    function handleIconClick(e: MouseEvent) {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();

        // 计算相对于文档的位置（考虑滚动偏移）
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        getDropdownIns().then(ins => {
            if (ins.visible) {
                ins.hide();
                return;
            }
            ins.setTheme(theme);
            ins.show(
                {
                    x: rect.left + scrollLeft,
                    y: rect.bottom + scrollTop,
                    height: rect.height,
                },
                props.getOptions(),
                handleConfirm,
            );
        });
    }

    return (
        <div className={['stk-filter', props.active ? 'stk-filter--active' : '', `stk-filter--${theme}`].filter(Boolean).join(' ')}>
            {props.children ?? <span>{props.col.title}</span>}
            <svg className="stk-filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" onClick={handleIconClick}>
                <path
                    fill="currentColor"
                    d="M950.58 0 l-894.06 0 q-91.93 17.17 -34.34 119.21 l293.97 251.54 l6.06 9.1 q16.17 20.2 16.17 47.48 l0 468.74 l1.01 8.08 q3.03 10.11 9.09 19.2 q2.02 2.02 5.05 7.07 q36.37 33.34 84.86 4.04 l216.19 -124.26 q21.21 -22.22 18.18 -50.51 l0 -332.36 l1.01 -11.12 q4.04 -26.26 22.23 -45.46 l292.96 -251.54 l9.1 -10.11 q43.44 -54.55 14.14 -81.82 q-28.29 -27.28 -61.62 -27.28 ZM832.38 119.21 l-277.81 235.38 l0 377.82 l-96.98 55.57 l0 -433.39 l-275.8 -235.38 l650.59 0 Z"
                />
            </svg>
        </div>
    );
}

/**
 * 表格筛选功能工厂函数 (BETA)
 *
 * 通过 StkTableContext 获取所在表格的 dataSource / theme / setFilter。
 * @beta
 * @returns
 */
export function createFilterCell(option?: CreateFilterCellOption) {
    const filterStatus: { current: Record<UniqKey, FilterStatus> } = { current: {} };

    function Filter(config?: FilterComponentConfig, component?: ComponentType<CustomHeaderCellProps<any>>) {
        function FilterHeaderCell(props: CustomHeaderCellProps<any>) {
            const ctx = useContext(StkTableContext);
            const colKey = props.col.dataIndex;

            // 从 StkTable 上下文获取 theme
            const theme = ctx?.theme || 'light';
            const filterNumber = filterStatus.current[colKey]?.value.length || 0;

            // 自动从数据中提取筛选选项（懒计算，仅在下拉打开时触发）
            function getAutoOptions(): FilterOption[] {
                if (!config?.autoOptions) return [];
                const dataSource: any[] = ctx?.dataSource || [];
                return extractFilterOptions(dataSource, colKey);
            }

            // 优先使用 FilterComponent 传入的 options，其次使用自动提取的选项
            function getResolvedOptions(): FilterOption[] {
                return config?.options ?? getAutoOptions();
            }

            function handleChange(value: FilterOption['value'][]) {
                filterStatus.current[colKey] = {
                    value,
                    filter: config?.filter ?? filterStatus.current[colKey]?.filter,
                };
                option?.onChange?.({ colKey, status: filterStatus.current[colKey] });
                ctx?.setFilter(filterStatus.current, option);
            }

            return (
                <FilterView {...props} theme={theme} active={filterNumber > 0} getOptions={getResolvedOptions} onChange={handleChange}>
                    {component ? React.createElement(component, props) : undefined}
                </FilterView>
            );
        }
        FilterHeaderCell.displayName = 'StkFilterHeaderCell';
        return FilterHeaderCell;
    }

    return {
        Filter,
        filterStatus,
    };
}
