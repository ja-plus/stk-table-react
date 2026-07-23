import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

const dataSource = [
    { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park', gender: 'male', email: 'john@example.com' },
    { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park', gender: 'male', email: 'jim@example.com' },
    { key: '3', name: 'Joe Black', age: 32, address: 'Sidney No. 1 Lake Park', gender: 'male', email: 'joe@example.com' },
    { key: '4', name: 'Jim Red', age: 32, address: 'London No. 2 Lake Park', gender: 'male', email: 'jim@example.com' },
    { key: '5', name: 'Jake White', age: 32, address: 'New York No. 2 Lake Park', gender: 'male', email: 'jake@example.com' },
];

export default function Fixed() {
    const { t } = useI18n();

    const [fixedColShadow, setFixedColShadow] = useState(false);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name', fixed: 'left', width: 100 },
        { title: t('age'), dataIndex: 'age', width: 100 },
        { title: t('address'), dataIndex: 'address', width: 200 },
        { title: t('gender'), dataIndex: 'gender', width: 70, fixed: 'left' },
        { title: t('email'), dataIndex: 'email', width: 200 },
        { title: t('phone'), dataIndex: 'phone', width: 100 },
        { title: t('company'), dataIndex: 'company', width: 200 },
        { title: t('operate'), dataIndex: 'operation', fixed: 'right', width: 100 },
    ];

    return (
        <div>
            <CheckItem checked={fixedColShadow} onChange={setFixedColShadow} text={t('showFixedShadow')} />
            <StkTable fixedColShadow={fixedColShadow} columns={columns} dataSource={dataSource} />
        </div>
    );
}
