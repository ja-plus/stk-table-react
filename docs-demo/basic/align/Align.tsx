import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import RadioGroup from '../../components/RadioGroup';
import { useI18n } from '../../hooks/useI18n/index';

type Data = {
    name: string;
};

export default function Align() {
    const { t } = useI18n();
    const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
    const [headerAlign, setHeaderAlign] = useState<'left' | 'center' | 'right'>('center');

    const columns: StkTableColumn<Data>[] = [
        { type: 'seq', title: t('seq'), dataIndex: '' as any, width: 50 },
        { title: t('name'), dataIndex: 'name', align, headerAlign },
    ];

    const dataSource: Data[] = [{ name: 'John Brown' }, { name: 'Jim Green' }, { name: 'Joe Black' }, { name: 'Jim Red' }];

    return (
        <div>
            <RadioGroup
                value={headerAlign}
                onChange={v => setHeaderAlign(v as any)}
                text={t('headerAlign')}
                options={[
                    { label: 'left', value: 'left' },
                    { label: 'center', value: 'center' },
                    { label: 'right', value: 'right' },
                ]}
            />
            <RadioGroup
                value={align}
                onChange={v => setAlign(v as any)}
                text={t('align')}
                options={[
                    { label: 'left', value: 'left' },
                    { label: 'center', value: 'center' },
                    { label: 'right', value: 'right' },
                ]}
            />
            <StkTable rowKey="name" columns={columns} dataSource={dataSource} />
        </div>
    );
}
