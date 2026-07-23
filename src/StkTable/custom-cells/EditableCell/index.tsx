import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, KeyboardEvent } from 'react';
import type { CustomCellProps } from '../../types';
import './EditableCell.less';

/** createEditableCell 配置选项 */
export interface CreateEditableCellOptions {
    /** 触发编辑的事件，默认 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 值变更回调 */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}

type EditableCellViewProps = CustomCellProps<any> & {
    trigger?: 'dblclick' | 'click';
    onChange?: (newValue: any) => void;
};

function EditableCellView(props: EditableCellViewProps) {
    const trigger = props.trigger || 'dblclick';
    const [editValue, setEditValue] = useState<any>(props.cellValue);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const displayValue = props.cellValue !== undefined && props.cellValue !== null ? props.cellValue : '';

    // cellValue 变化且未在编辑时同步 editValue
    useEffect(() => {
        if (!isEditing) setEditValue(props.cellValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.cellValue]);

    // 进入编辑后聚焦输入框
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    function refocusContainer() {
        const el = rootRef.current?.closest?.('.stk-table') as HTMLElement | null;
        el?.focus();
    }

    function finishEditing() {
        setIsEditing(false);
        const newValue = editValue;
        const { row, col } = props;
        (row[col.dataIndex] as any) = newValue;
        props.onChange?.(newValue);
        refocusContainer();
    }

    function cancelEditing() {
        setIsEditing(false);
        setEditValue(props.cellValue);
        refocusContainer();
    }

    function onTrigger(e: MouseEvent) {
        if (e.type !== trigger) return;
        setEditValue(props.cellValue);
        setIsEditing(true);
    }

    function onBlur() {
        if (!isEditing) return;
        finishEditing();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            finishEditing();
        } else if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            e.stopPropagation();
            cancelEditing();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.stopPropagation();
        } else if (e.key === 'Tab') {
            finishEditing();
        } else {
            e.stopPropagation();
        }
    }

    return (
        <div ref={rootRef} className="stk-editable-cell" onDoubleClick={onTrigger} onClick={onTrigger}>
            {!isEditing ? (
                displayValue
            ) : (
                <input
                    ref={inputRef}
                    className="stk-editable-cell-input"
                    value={editValue ?? ''}
                    onBlur={onBlur}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={onKeydown}
                />
            )}
        </div>
    );
}

/**
 * 可编辑单元格工厂函数
 * @param option 配置选项
 * @returns EditableCell 组件
 */
export function createEditableCell(option?: CreateEditableCellOptions) {
    function EditableCell(props: CustomCellProps<any>) {
        return (
            <EditableCellView
                {...props}
                trigger={option?.trigger || 'dblclick'}
                onChange={newValue => {
                    option?.onChange?.(newValue, props.row, props.col.dataIndex);
                }}
            />
        );
    }

    return {
        EditableCell,
    };
}
