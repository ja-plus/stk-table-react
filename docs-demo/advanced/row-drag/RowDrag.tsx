import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

export default function RowDrag() {
    const { t } = useI18n();

    const [virtual, setVirtual] = useState(false);

    const [columns, setColumns] = useState<StkTableColumn<any>[]>([
        {
            type: 'dragRow',
            key: 'dragRow',
            width: 100,
            title: t('builtinDrag'),
            dataIndex: '',
            align: 'center',
        },
        { dataIndex: 'email', title: t('email') },
        { dataIndex: 'phone', title: t('phone'), width: 150 },
    ]);

    const data = new Array(100).fill(0).map((_, index) => {
        return {
            id: index,
            name: 'name' + index,
            email: 'email' + index + '@example.com',
            phone: '123-456-7890',
        };
    });

    return (
        <div>
            <CheckItem checked={virtual} onChange={setVirtual} text={t('virtual')} />
            <StkTable
                columns={columns}
                onUpdateColumns={newCols => setColumns(newCols as StkTableColumn<any>[])}
                rowKey="id"
                style={{ height: '300px' }}
                headerDrag
                colKey={col => col.key || col.dataIndex}
                virtual={virtual}
                dataSource={data}
            />
        </div>
    );
}
