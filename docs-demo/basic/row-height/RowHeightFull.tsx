import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import RangeInput from '../../components/RangeInput';
import { useI18n } from '../../hooks/useI18n/index';

export default function RowHeightFull() {
    const { t } = useI18n();
    const [height, setHeight] = useState(300);
    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('address'), dataIndex: 'address', maxWidth: 200 },
    ];
    const dataSource = [
        { name: `Jack`, address: `Beijing Forbidden City` },
        { name: `Tom`, address: `Shanghai` },
        { name: `Lucy`, address: `Guangzhou` },
        { name: `Lily`, address: `Shenzhen` },
    ];
    return (
        <div>
            <style>{`.rh-container { display: flex; flex-direction: column; } .rh-container .stk-table { flex: 1; } .rh-container .stk-table .stk-table-scroll-container { flex: 1; }`}</style>
            <div className="rh-container" style={{ height: height + 'px' }}>
                <RangeInput value={height} onChange={setHeight} min={0} max={600} label={t('height')} suffix="px" />
                <StkTable headerRowHeight={50} columns={columns} dataSource={dataSource} />
            </div>
        </div>
    );
}
