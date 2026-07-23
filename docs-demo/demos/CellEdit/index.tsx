import { useCallback, useMemo, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable/index';
import EditCell from './EditCell';
import EditRowSwitch from './EditRowSwitch';
import type { RowDataType } from './type';
import { CellEditRefreshContext } from './context';
import { useI18n } from '../../hooks/useI18n/index';

export default function CellEditDemo() {
    const { t } = useI18n();

    // 初始化表格数据
    const [tableData, setTableData] = useState<RowDataType[]>([
        { id: 1, name: '张三', age: 28, address: '北京市海淀区' },
        { id: 2, name: '李四', age: 32, address: '上海市浦东新区', _isEditing: true },
        { id: 3, name: 'Jack', age: 45, address: 'London' },
        { id: 4, name: 'Rose', age: 22, address: 'New York' },
    ]);

    const refresh = useCallback(() => {
        setTableData(prev => [...prev]);
    }, []);

    // 定义表格列
    const columns: StkTableColumn<RowDataType>[] = useMemo(
        () => [
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: t('name'), dataIndex: 'name', width: 100, customCell: EditCell },
            { title: t('age'), dataIndex: 'age', width: 80, customCell: EditCell },
            { title: t('address'), dataIndex: 'address', customCell: EditCell },
            { title: t('edit'), dataIndex: '_isEditing', width: 80, customCell: EditRowSwitch },
        ],
        [t],
    );

    return (
        <CellEditRefreshContext.Provider value={refresh}>
            <div className="cell-edit-demo">
                <StkTable
                    rowKey="id"
                    cellActive
                    selectedCellRevokable={false}
                    rowActive={false}
                    rowHeight={40}
                    columns={columns}
                    dataSource={tableData}
                />
                <div>data-source:</div>
                <div>
                    <div>[</div>
                    {tableData.map(row => (
                        <div key={row.id} style={{ paddingLeft: 16 }}>
                            {JSON.stringify(row)},
                        </div>
                    ))}
                    <div>]</div>
                </div>
                <style>{`
.cell-edit-demo .edit-cell {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: default;
}
.cell-edit-demo .edit-cell .edit-input {
    width: 100%;
    font-size: inherit;
    line-height: 2;
    box-sizing: border-box;
    outline: none;
    padding: 0 8px;
}
.cell-edit-demo .editable-status-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
`}</style>
            </div>
        </CellEditRefreshContext.Provider>
    );
}
