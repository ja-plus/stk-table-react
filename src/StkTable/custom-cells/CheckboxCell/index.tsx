import { useContext, useRef } from 'react';
import type { CustomCellProps, CustomHeaderCellProps } from '../../types';
import { StkTableContext } from '../../context';
import './CheckboxCell.less';

/** createCheckboxCell 配置选项 */
export interface createCheckboxCellOptions<T = any> {
    /**
     * 行数据中表示选中状态的字段名
     * @default '_isChecked'
     */
    field?: string;
    /**
     * 自定义 checkbox 组件（如 Ant Design 的 Checkbox）
     * 不传则使用原生 input[type=checkbox]
     */
    checkboxComponent?: any;
    /**
     * 单元格 checkbox 状态变更回调
     * @param checked 是否选中
     * @param row 当前行数据
     */
    onChange?: (checked: boolean, row: T) => void;
    /**
     * 全选 checkbox 状态变更回调
     * @param checked 是否全选
     */
    onSelectAll?: (checked: boolean) => void;
}

type CheckboxViewProps = {
    /** 当前是否选中 */
    checked?: boolean;
    /** 是否半选状态 */
    indeterminate?: boolean;
    /** 自定义 checkbox 组件 */
    customComponent?: any;
    onChange?: (checked: boolean) => void;
};

function CheckboxView(props: CheckboxViewProps) {
    const { checked, indeterminate, customComponent: CustomComp, onChange } = props;
    /** 防重保护：部分 UI 库会同时触发多个事件 */
    const lastValueRef = useRef<boolean | undefined>(undefined);

    function handleChange(e: any) {
        let c: boolean;
        if (typeof e === 'boolean') {
            c = e;
        } else if (e?.target?.checked !== undefined) {
            c = e.target.checked;
        } else {
            c = !!e;
        }
        if (c === lastValueRef.current) return;
        lastValueRef.current = c;
        onChange?.(c);
    }

    if (CustomComp) {
        return (
            <div className="stk-checkbox-cell">
                <CustomComp
                    modelValue={checked}
                    checked={checked}
                    indeterminate={indeterminate}
                    onChange={handleChange}
                    onClick={(e: any) => e?.stopPropagation?.()}
                />
            </div>
        );
    }

    return (
        <div className="stk-checkbox-cell">
            <input
                type="checkbox"
                checked={!!checked}
                ref={el => {
                    if (el) el.indeterminate = !!indeterminate;
                }}
                className="stk-checkbox-native"
                onChange={handleChange}
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
}

/**
 * Checkbox 工厂函数
 *
 * 用于快速创建多选框单元格和表头单元格组件。
 *
 * @param options 配置选项
 * @returns 包含 CheckboxCell 和 CheckboxAllCell 组件的对象
 *
 * @example
 * ```tsx
 * const { CheckboxCell, CheckboxAllCell } = createCheckboxCell({
 *   field: '_isChecked',
 *   onChange: (checked, row) => { row._isChecked = checked },
 * });
 *
 * const columns = [
 *   {
 *     dataIndex: 'checkbox',
 *     width: 50,
 *     customCell: CheckboxCell,
 *     customHeaderCell: CheckboxAllCell,
 *   },
 *   // ...other columns
 * ];
 * ```
 */
export function createCheckboxCell<T extends Record<string, any> = any>(options?: createCheckboxCellOptions<T>) {
    const field = options?.field ?? '_isChecked';
    const customComponent = options?.checkboxComponent;

    /** 单元格 Checkbox 组件 - 用于 customCell */
    function CheckboxCell(props: CustomCellProps<any>) {
        const isChecked = !!props.row?.[field];

        function handleChange(checked: boolean) {
            props.row[field] = checked;
            options?.onChange?.(checked, props.row);
        }

        return <CheckboxView checked={isChecked} customComponent={customComponent} onChange={handleChange} />;
    }

    /** 表头 Checkbox 组件 - 用于 customHeaderCell（全选/半选） */
    function CheckboxAllCell(_props: CustomHeaderCellProps<any>) {
        const ctx = useContext(StkTableContext);
        const dataSource = ctx?.dataSource || [];

        const isCheckAll = dataSource.length > 0 && dataSource.every((item: any) => !!item[field]);
        const checkedCount = dataSource.filter((item: any) => !!item[field]).length;
        const isIndeterminate = checkedCount > 0 && checkedCount < dataSource.length;

        function handleChange(checked: boolean) {
            dataSource.forEach((item: any) => {
                item[field] = checked;
            });
            options?.onSelectAll?.(checked);
        }

        return <CheckboxView checked={isCheckAll} indeterminate={isIndeterminate} customComponent={customComponent} onChange={handleChange} />;
    }

    return {
        CheckboxCell,
        CheckboxAllCell,
    };
}
