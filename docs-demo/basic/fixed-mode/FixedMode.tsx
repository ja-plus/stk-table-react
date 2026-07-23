import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import RangeInput from '../../components/RangeInput';
import { useI18n } from '../../hooks/useI18n/index';

export default function FixedMode() {
    const { t } = useI18n();
    const [width, setWidth] = useState(50);
    const columns: StkTableColumn<any>[] = [
        { dataIndex: 'id', title: t('id') + '(100px)', width: '100px' },
        { dataIndex: 'name', title: t('name') },
        { dataIndex: 'address', title: t('address') },
    ];
    const data = new Array(200).fill(0).map((it, index) => ({ id: index, name: 'Jack', address: 'Beijing' }));
    return (
        <div>
            <RangeInput value={width} onChange={setWidth} min={0} max={100} label={t('width')} suffix="%" />
            <StkTable style={{ height: 150 }} rowKey="id" virtual fixedMode width={width + '%'} columns={columns} dataSource={data} />
            <div>headless</div>
            <StkTable style={{ height: 140 }} rowKey="id" virtual fixedMode headless width={width + '%'} columns={columns} dataSource={data} />
        </div>
    );
}
