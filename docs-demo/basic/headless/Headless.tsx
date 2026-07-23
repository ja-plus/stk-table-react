import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n';

export default function Headless() {
    const { t } = useI18n();
    const [headless, setHeadless] = useState(true);
    const columns: StkTableColumn<any>[] = [
        { dataIndex: 'vHead', title: t('vHead'), className: 'v-head', width: 100 },
        { dataIndex: 'col1', title: t('col1') },
        { dataIndex: 'vHead2', title: t('vHead2'), className: 'v-head', width: 100 },
        { dataIndex: 'col2', title: t('col2') },
    ];
    const data = [
        { vHead: 'Name', col1: 'Jack', vHead2: 'Birthday', col2: '1990-01-01' },
        { vHead: 'Age', col1: '24', vHead2: 'School', col2: 'University' },
        { vHead: 'Address', col1: 'Beijing', vHead2: 'ID Card', col2: '1234567890' },
    ];
    return (
        <div>
            <style>{`.headless-demo .v-head { background-color: #eee; font-weight: bold; } .headless-demo .stk-table.dark .v-head { background-color: #333; }`}</style>
            <div className="headless-demo">
                <CheckItem checked={headless} onChange={setHeadless} text={t('headless')} />
                <StkTable rowKey="id" rowActive={false} rowHover={false} headless={headless} columns={columns} dataSource={data} />
            </div>
        </div>
    );
}
