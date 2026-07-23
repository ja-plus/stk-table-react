import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, CustomCellProps } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n/index';

export default function Checkbox() {
    const { t } = useI18n();

    // 模拟数据
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

    // 是否全选
    const isCheckAll = dataSource.length > 0 && dataSource.every(item => item._isChecked);
    const checkedCount = dataSource.filter(item => item._isChecked).length;
    const isCheckPartial = checkedCount > 0 && checkedCount < dataSource.length;
    const selectedItems = dataSource.filter(item => item._isChecked);

    function toggleAll(checked: boolean) {
        setDataSource(prev => prev.map(item => ({ ...item, _isChecked: checked })));
    }

    function toggleRow(id: any, checked: boolean) {
        setDataSource(prev => prev.map(item => (item.id === id ? { ...item, _isChecked: checked } : item)));
    }

    const HeaderCheckbox = () => (
        <span>
            <input
                type="checkbox"
                style={{ verticalAlign: 'middle' }}
                checked={isCheckAll}
                ref={el => {
                    if (el) el.indeterminate = isCheckPartial;
                }}
                onChange={e => toggleAll(e.target.checked)}
            />
        </span>
    );

    const RowCheckbox = (props: CustomCellProps<any>) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input type="checkbox" checked={!!props.row?._isChecked} onChange={e => toggleRow(props.row?.id, e.target.checked)} />
        </div>
    );

    const columns: StkTableColumn<any>[] = [
        {
            dataIndex: 'checkbox' as any,
            align: 'center',
            width: 70,
            fixed: 'left',
            customHeaderCell: HeaderCheckbox,
            customCell: RowCheckbox,
        },
        { title: t('name'), dataIndex: 'name', width: 120 },
        { title: t('age'), dataIndex: 'age', width: 80, align: 'right' },
        { title: t('address'), dataIndex: 'address', width: 200 },
    ];

    return (
        <div>
            <style>{`
                .info-box h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
                .selected-items { display: flex; flex-wrap: wrap; gap: 8px; }
                .selected-item { padding: 4px 12px; background-color: #1890ff; color: white; border-radius: 16px; }
                input[type='checkbox'] { width: 16px; height: 16px; cursor: pointer; }
            `}</style>
            <StkTable style={{ maxHeight: '300px' }} rowKey="id" virtual bordered columns={columns} dataSource={dataSource} />
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
        </div>
    );
}
