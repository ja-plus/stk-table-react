import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

export default function StripeVt() {
    const { t } = useI18n();
    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];
    const dataSource = Array.from({ length: 500 }, (_, i) => ({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address: `London, Park Lane no. ${i}`,
        gender: i % 2 === 0 ? 'male' : 'female',
    }));
    return <StkTable style={{ height: 200 }} virtual stripe columns={columns} dataSource={dataSource} />;
}
