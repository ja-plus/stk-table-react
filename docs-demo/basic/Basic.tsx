import { StkTable } from '../StkTable';
import type { StkTableColumn } from '../../src/StkTable';
import { useI18n } from '../hooks/useI18n/index';

type Data = {
    name: string;
    age: number;
    address: string;
    gender: 'male' | 'female';
};

export default function Basic() {
    const { t } = useI18n();
    const columns: StkTableColumn<Data>[] = [
        { type: 'seq', title: t('seq'), dataIndex: '' as any, width: 50 },
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age', headerAlign: 'right', align: 'right' },
        { title: t('gender'), dataIndex: 'gender', align: 'center' },
        { title: t('address'), dataIndex: 'address' },
    ];
    const dataSource: Data[] = [
        { name: `Jack`, age: 18, address: `Beijing Forbidden City `, gender: 'male' },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
    ];
    return <StkTable style={{ height: 200 }} rowKey="name" columns={columns} dataSource={dataSource} />;
}
