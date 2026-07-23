import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

type DataType = {
    key: string;
    name: string;
    age: number;
    gender: string;
    corporation: string;
    address: string;
};

export default function Overflow() {
    const { t } = useI18n();
    const [virtual, setVirtual] = useState(false);
    const [showOverflow, setShowOverflow] = useState(true);
    const [showHeaderOverflow, setShowHeaderOverflow] = useState(false);

    const columns: StkTableColumn<DataType>[] = [
        { title: t('name'), dataIndex: 'name', width: 100 },
        { title: t('age'), dataIndex: 'age' },
        { title: t('gender'), dataIndex: 'gender' },
        { title: t('corporation'), dataIndex: 'corporation', maxWidth: 120 },
        { title: t('address'), dataIndex: 'address', maxWidth: 120 },
        { title: t('longTitle'), dataIndex: 'address', maxWidth: 120 },
    ];

    const dataSource: DataType[] = [
        { key: '1', name: 'John Brown', age: 32, gender: 'male', corporation: 'Netscape Communications Corporation', address: 'New York No. 1 Lake Park' },
        { key: '2', name: 'Jim Green', age: 42, gender: 'male', corporation: 'Netscape Communications Corporation', address: 'London No. 1 Lake Park' },
        { key: '3', name: 'Joe Black', age: 32, gender: 'male', corporation: 'Netscape Communications Corporation', address: 'Sidney No. 1 Lake Park' },
    ];

    return (
        <div>
            <CheckItem checked={showOverflow} onChange={setShowOverflow} text="showOverflow" />
            <CheckItem checked={showHeaderOverflow} onChange={setShowHeaderOverflow} text="showHeaderOverflow" />
            <CheckItem checked={virtual} onChange={setVirtual} text="virtual" />
            <StkTable rowKey="key" virtual={virtual} showOverflow={showOverflow} showHeaderOverflow={showHeaderOverflow} columns={columns} dataSource={dataSource} />
        </div>
    );
}
