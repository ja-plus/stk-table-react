import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n/index';

type DataType = { key: string; name: string; age: number; gender: string };

export default function Sort() {
    const { t } = useI18n();
    const columns: StkTableColumn<DataType>[] = [
        { title: t('name'), dataIndex: 'name', width: 100, sorter: true },
        { title: t('age'), dataIndex: 'age', sorter: true },
        { title: t('gender'), dataIndex: 'gender', sorter: true },
    ];
    const dataSource: DataType[] = Array.from({ length: 100 }, (_, i) => ({
        key: i.toString(),
        name: `Name ${i}`,
        age: Math.round(Math.random() * 100),
        gender: i % 2 === 0 ? 'Male' : 'Female',
    }));
    return <StkTable style={{ height: 200 }} rowKey="key" columns={columns} dataSource={dataSource} />;
}
