import { CustomCellProps } from '../../types';

/** createEditableCell 配置选项 */
export interface CreateEditableCellOptions {
    /** 触发编辑的事件，默认 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 值变更回调 */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}
/**
 * 可编辑单元格工厂函数
 * @param option 配置选项
 * @returns EditableCell 组件
 */
export declare function createEditableCell(option?: CreateEditableCellOptions): {
    EditableCell: (props: CustomCellProps<any>) => import("react").JSX.Element;
};
