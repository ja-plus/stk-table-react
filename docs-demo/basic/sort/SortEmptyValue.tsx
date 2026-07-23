import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

type DataType = { key: string; name: string; age: number | null };

export default function SortEmptyValue() {
    const { t } = useI18n();
    const columns: StkTableColumn<DataType>[] = [
        { type: 'seq', title: t('seq'), dataIndex: '' as any, width: 50 },
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age', align: 'right', sortType: 'number', sorter: true },
    ];
    const dataSource: DataType[] = [
        { key: '1', name: 'John Brown', age: 365 },
        { key: '2', name: 'John Brown', age: 60 },
        { key: '3', name: 'John Brown', age: 90 },
        { key: '4', name: 'John Brown', age: null },
        { key: '5', name: 'John Brown', age: 730 },
    ];
    return <StkTable style={{ height: 200 }} rowKey="key" sortConfig={{ emptyToBottom: true }} columns={columns} dataSource={dataSource} />;
}
