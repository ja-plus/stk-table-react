import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, Order, SortConfig } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

type DataType = { key: string; name: string };

export default function SortRemote() {
    const { t } = useI18n();
    const columns: StkTableColumn<DataType>[] = [
        { title: t('seq'), dataIndex: '' as any, type: 'seq', width: 50 },
        { title: t('name'), dataIndex: 'name', sorter: true },
    ];
    const [dataSource, setDataSource] = useState<DataType[]>(
        Array.from({ length: 100 }, (_, i) => ({ key: String(i), name: `Name ${i}` })),
    );

    async function handleSortChange(col: StkTableColumn<DataType> | null, order: Order, data: DataType[], sortType: SortConfig<DataType>) {
        const result = await new Promise<DataType[]>(resolve => {
            if (order === 'desc') {
                resolve([
                    { key: '1', name: 'Name 1' },
                    { key: '2', name: 'Name 2' },
                ]);
            } else if (order === 'asc') {
                resolve([
                    { key: '3', name: 'Name 3' },
                    { key: '2', name: 'Name 2' },
                    { key: '1', name: 'Name 1' },
                ]);
            } else {
                resolve([
                    { key: '1', name: 'Name 1' },
                    { key: '3', name: 'Name 3' },
                    { key: '2', name: 'Name 2' },
                    { key: '4', name: 'Name 4' },
                ]);
            }
        });
        setDataSource(result);
    }

    return <StkTable style={{ height: 200 }} rowKey="key" sortRemote columns={columns} dataSource={dataSource} onSortChange={handleSortChange} />;
}
