import { useContext } from 'react';
import type { ChangeEvent } from 'react';
import type { CustomCellProps } from '../../../src/StkTable/index';
import type { RowDataType } from './type';
import { CellEditRefreshContext } from './context';

export default function EditRowSwitch(props: CustomCellProps<RowDataType>) {
    const refresh = useContext(CellEditRefreshContext);
    const { row } = props;

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const isChecked = e.target.checked;
        row._isEditing = isChecked;
        refresh();
    }

    return (
        <div className="editable-status-cell">
            <input type="checkbox" checked={!!row._isEditing} onChange={handleChange} />
        </div>
    );
}
