import { CustomCellProps, CustomHeaderCellProps } from '../../types';

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
export declare function createCheckboxCell<T extends Record<string, any> = any>(options?: createCheckboxCellOptions<T>): {
    CheckboxCell: (props: CustomCellProps<any>) => import("react").JSX.Element;
    CheckboxAllCell: (_props: CustomHeaderCellProps<any>) => import("react").JSX.Element;
};
