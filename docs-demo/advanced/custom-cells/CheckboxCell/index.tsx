import { useMemo, useState } from 'react';
import { StkTable } from '../../../StkTable';
import { createCheckboxCell } from '../../../../src/StkTable/index';
import { useI18n } from '../../../hooks/useI18n/index';

export default function CheckboxCellDemo() {
    const { t } = useI18n();

    const [dataSource, setDataSource] = useState<Record<string, any>[]>([
        { id: 1, name: 'Alice', age: 25, address: 'Haidian District, Beijing', _isChecked: true },
        { id: 2, name: 'Bob', age: 28, address: 'Pudong New Area, Shanghai', _isChecked: true },
        { id: 3, name: 'Charlie', age: 32, address: 'Tianhe District, Guangzhou' },
        { id: 4, name: 'David', age: 29, address: 'Nanshan District, Shenzhen' },
        { id: 5, name: 'Eve', age: 27, address: 'Xihu District, Hangzhou' },
        ...Array.from({ length: 25 }, (_, i) => ({
            id: i + 6,
            name: `User ${i + 6}`,
            age: 25 + i,
            address: `Address ${i + 6}`,
        })),
    ]);

    const { CheckboxCell, CheckboxAllCell } = useMemo(
        () =>
            createCheckboxCell({
                field: '_isChecked',
                onChange: (checked: any, row: any) => {
                    console.log('行选中变更:', checked, row);
                    setDataSource(prev => [...prev]);
                },
                onSelectAll: (checked: any) => {
                    console.log('全选变更:', checked);
                    setDataSource(prev => [...prev]);
                },
            }),
        [],
    );

    const columns = useMemo(
        () => [
            {
                dataIndex: 'checkbox',
                align: 'center',
                width: 70,
                fixed: 'left',
                customCell: CheckboxCell,
                customHeaderCell: CheckboxAllCell,
            },
            { title: t('name'), dataIndex: 'name', width: 120 },
            { title: t('age'), dataIndex: 'age', width: 80, align: 'right' },
            { title: t('address'), dataIndex: 'address', width: 200 },
        ],
        [CheckboxCell, CheckboxAllCell, t],
    );

    const selectedItems = useMemo(() => {
        return dataSource.filter(item => item._isChecked);
    }, [dataSource]);

    return (
        <div className="checkbox-cell-demo">
            <StkTable
                style={{ maxHeight: 300 }}
                rowKey="id"
                virtual
                bordered
                columns={columns}
                dataSource={dataSource}
            />
            <div className="info-box">
                <h3>{t('selected')}:</h3>
                <div className="selected-items">
                    {selectedItems.length > 0 ? (
                        selectedItems.map(item => (
                            <span key={item.id} className="selected-item">
                                {item.name}
                            </span>
                        ))
                    ) : (
                        <span>{t('noSelect')}</span>
                    )}
                </div>
            </div>
            <style>{`
.checkbox-cell-demo .info-box h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
}
.checkbox-cell-demo .selected-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.checkbox-cell-demo .selected-item {
    padding: 4px 12px;
    background-color: #1890ff;
    color: white;
    border-radius: 16px;
}
`}</style>
        </div>
    );
}
