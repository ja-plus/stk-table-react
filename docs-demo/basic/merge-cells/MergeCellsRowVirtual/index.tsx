import { useState } from 'react';
import { StkTable } from '../../../StkTable';
import type { StkTableColumn } from '../../../../src/StkTable';
import { dataSource as initialDataSource } from './dataSource';
import { useI18n } from '../../../hooks/useI18n/index';

function mergeCells({ row, col }: { row: any; col: StkTableColumn<any> }) {
    if (!row.rowspan) return;
    return { rowspan: row.rowspan[col.dataIndex] || 1 };
}

export default function MergeCellsRowVirtual() {
    const { t } = useI18n();

    const [dataSource, setDataSource] = useState<any[]>(initialDataSource);

    const columns: StkTableColumn<any>[] = [
        { title: t('id'), dataIndex: 'id', width: 100 },
        { title: t('continent'), dataIndex: 'continent', width: 100, mergeCells },
        { title: t('country'), dataIndex: 'country', width: 120, mergeCells },
        { title: t('province'), dataIndex: 'province' },
    ];

    function addMoreData() {
        // add 1000 row
        const last = dataSource.at(-1);
        const id = last?.id.split('-') || [];
        const startIndex = Number(id[0] || 0);
        const data = [];
        const childCount = 10;
        for (let i = startIndex; i < startIndex + 100; i++) {
            for (let j = 0; j < childCount; j++) {
                const row: any = {
                    id: i + '-' + j,
                    continent: 'Asia' + i,
                    country: 'China',
                    province: 'Beijing',
                };
                if (j === 0) {
                    row.rowspan = {
                        continent: childCount,
                    };
                }
                data.push(row);
            }
        }
        setDataSource(dataSource.concat(data));
    }

    return (
        <div>
            <button className="btn" onClick={addMoreData}>
                {t('add1000Row')}
            </button>
            <StkTable style={{ maxHeight: '300px' }} virtual cellHover rowKey="id" columns={columns} dataSource={dataSource} />
        </div>
    );
}
