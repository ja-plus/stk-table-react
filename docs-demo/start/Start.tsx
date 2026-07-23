import { useEffect, useRef } from 'react';
import { StkTable } from '../StkTable';
import type { StkTableColumn, StkTableRef } from '../../src/StkTable/index';
import { useI18n } from '../hooks/useI18n/index';

type DataType = {
    id: string;
    name: string;
    age: number;
    address: string;
};

export default function Start() {
    const { t } = useI18n();

    const stkTableRef = useRef<StkTableRef<DataType>>(null);

    const columns: StkTableColumn<DataType>[] = [
        { title: t('name'), dataIndex: 'name', key: 'name' },
        { title: t('age'), dataIndex: 'age', key: 'age', align: 'right' },
        { title: t('address'), dataIndex: 'address', key: 'address' },
    ];
    const dataSource: DataType[] = [
        { id: 'k1', name: 'Tom', age: 18, address: 'Beijing' },
        { id: 'k2', name: 'Jerry', age: 19, address: 'Shanghai' },
        { id: 'k3', name: 'Jack', age: 20, address: 'London' },
        { id: 'k4', name: 'Rose', age: 22, address: 'New York' },
    ];

    useEffect(() => {
        const interval = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['k1']); // highlight row
        }, 2000);
        return () => {
            window.clearInterval(interval);
        };
    }, []);

    return <StkTable ref={stkTableRef} rowKey="id" columns={columns} dataSource={dataSource}></StkTable>;
}
