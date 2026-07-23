import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

const dataSource = new Array(1000).fill(0).map((_, index) => {
    return {
        name: `Jack ${index}`,
        age: 18 + index,
        address: `Beijing Forbidden City ${index}`,
        gender: index % 2 === 0 ? 'male' : 'female',
    };
});

export default function ScrollRowByRow() {
    const { t } = useI18n();
    const [rowByRow, setRowByRow] = useState<boolean | 'scrollbar'>(true);

    const columns: StkTableColumn<any>[] = [
        { type: 'seq', width: 50, dataIndex: '' as any, title: t('seq') },
        { title: t('name'), dataIndex: 'name', width: 100, sorter: true },
        { title: t('age'), dataIndex: 'age', width: 100, sorter: true },
        { title: t('gender'), dataIndex: 'gender', width: 100, sorter: true },
        { title: t('address'), dataIndex: 'address', sorter: true },
    ];

    function onlyScrollbarChange(checked: boolean) {
        if (checked) {
            setRowByRow('scrollbar');
        } else {
            setRowByRow(false);
        }
    }

    return (
        <div>
            <CheckItem checked={rowByRow !== false} onChange={v => setRowByRow(v ? true : false)} text="scroll-row-by-row" />
            <CheckItem checked={rowByRow === 'scrollbar'} onChange={onlyScrollbarChange} text="仅拖动滚动条触发|Only drag scrollbar" />
            <StkTable
                style={{ height: '200px' }}
                scrollRowByRow={rowByRow}
                virtual
                rowHeight={30}
                headerRowHeight={68}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
    );
}
