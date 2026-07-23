import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import RangeInput from '../../components/RangeInput';
import { useI18n } from '../../hooks/useI18n';

const dataSource = new Array(3).fill(0).map((_, index) => {
    return {
        name: `Jack ${index}`,
        age: 18 + index,
        address: `Beijing Forbidden City ${index}`,
        gender: index % 2 === 0 ? 'male' : 'female',
    };
});

export default function Default() {
    const { t } = useI18n();

    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(150);

    const columns: StkTableColumn<any>[] = [
        { title: t('name'), dataIndex: 'name' },
        { title: t('age'), dataIndex: 'age' },
        { title: t('address'), dataIndex: 'address' },
        { title: t('gender'), dataIndex: 'gender' },
    ];

    return (
        <div>
            <div>
                <RangeInput value={width} onChange={setWidth} min={100} max={800} label={t('width')} suffix="px" />
            </div>
            <div>
                <RangeInput value={height} onChange={setHeight} min={100} max={800} label={t('height')} suffix="px" />
            </div>
            <div style={{ overflow: 'auto' }}>
                <StkTable style={{ width: width + 'px', height: height + 'px' }} columns={columns} dataSource={dataSource} />
            </div>
        </div>
    );
}
