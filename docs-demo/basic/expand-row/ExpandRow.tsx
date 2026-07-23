import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

const data = new Array(100).fill(0).map((it, index) => {
    return {
        id: index,
        name: 'name' + index,
        address: 'Beijing' + index,
        phone: '1234567890' + index,
    };
});

export default function ExpandRow() {
    const { t } = useI18n();

    const [virtual, setVirtual] = useState(false);
    const [stripe, setStripe] = useState(false);

    const columns: StkTableColumn<any>[] = [
        { type: 'expand', dataIndex: '' as any, width: 50, align: 'center', fixed: 'left' },
        { dataIndex: 'id', title: t('id'), width: 100 },
        { dataIndex: 'address', title: t('address') },
    ];

    function handleToggleRowExpand(d: any) {
        console.log('handleToggleRowExpand', d);
    }

    return (
        <div>
            <CheckItem checked={virtual} onChange={setVirtual} text={t('virtual')} />
            <CheckItem checked={stripe} onChange={setStripe} text={t('stripe')} />
            <StkTable
                rowKey="id"
                style={{ height: '200px' }}
                virtual={virtual}
                stripe={stripe}
                expandConfig={{ height: 80 }}
                columns={columns}
                dataSource={data}
                onToggleRowExpand={handleToggleRowExpand}
                renderExpand={row => (
                    <div>
                        <p>
                            ID: {row.id}, Phone: {row.phone}
                        </p>
                        <p>Name: {row.name}</p>
                        <p>Address: {row.address}</p>
                    </div>
                )}
            />
        </div>
    );
}
