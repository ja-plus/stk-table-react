import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

export default function ColumnWidth() {
    const { t } = useI18n();
    const [virtual, setVirtual] = useState(false);
    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name', width: 100 },
        { title: t('age'), dataIndex: 'age' },
        { title: t('gender'), dataIndex: 'gender' },
        { title: t('address'), dataIndex: 'address', maxWidth: 200 },
    ];
    const dataSource = [
        { name: `Jack`, age: 18, address: `Beijing Forbidden City, ${' Long text'.repeat(20)}`, gender: 'male' },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
        ...new Array(50).fill(0).map((_, i) => ({ name: `Jack${i}`, age: 18, address: `Beijing Forbidden City `, gender: 'male' })),
    ];
    return (
        <div>
            <CheckItem checked={virtual} onChange={setVirtual} text={t('virtual')} />
            <StkTable style={{ height: 200 }} virtual={virtual} columns={columns} dataSource={dataSource} />
        </div>
    );
}
