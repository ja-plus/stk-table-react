import { useContext, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { CustomCellProps } from '../../../src/StkTable/index';
import { CellEditRefreshContext } from './context';

export default function EditCell(props: CustomCellProps<any>) {
    const refresh = useContext(CellEditRefreshContext);
    const { row, col } = props;

    const [editValue, setEditValue] = useState<any>(props.cellValue);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setEditValue(props.cellValue);
    }, [props.cellValue]);

    /** 是否在行编辑模式 */
    const isEditMode = !!row._isEditing;
    const editing = isEditMode || isEditing;

    function startEditing() {
        setIsEditing(true);
        // 延迟设置焦点，确保输入框已经渲染
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }

    function setCellValue(v: string) {
        (row[col.dataIndex] as any) = v;
    }

    function finishEditing(v: string) {
        setIsEditing(false);
        setCellValue(v);
        refresh();
    }

    function cancelEditing() {
        // 行编辑模式不用取消
        if (isEditMode) return;
        if (!isEditing) return;
        setIsEditing(false);
        setEditValue(props.cellValue);
    }

    /** 如果在行编辑模式，则实时更新 */
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const v = e.target.value;
        setEditValue(v);
        if (isEditMode) {
            setCellValue(v);
            refresh();
        }
    }

    function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            finishEditing((e.target as HTMLInputElement).value);
        } else if (e.key === 'Escape' || e.key === 'Esc') {
            cancelEditing();
        }
    }

    return (
        <div className="edit-cell" title={editing ? '回车保存' : '双击编辑'} onDoubleClick={startEditing}>
            {!editing ? (
                props.cellValue
            ) : (
                <input
                    ref={inputRef}
                    className="edit-input"
                    value={editValue ?? ''}
                    onBlur={cancelEditing}
                    onChange={handleChange}
                    onKeyUp={handleKeyUp}
                />
            )}
        </div>
    );
}
