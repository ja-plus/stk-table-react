import { useRef, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../src/StkTable';
import { getDataSource2 } from './config';
import { useI18n } from '../../hooks/useI18n';

export default function TreeVirtualList() {
    const { t } = useI18n();
    const stkTableRef = useRef<StkTableRef<any>>(null);

    const columns: StkTableColumn<any>[] = [
        { type: 'tree-node', title: t('area'), dataIndex: 'area', width: 200 },
        { title: t('gdp'), dataIndex: 'gdp', align: 'right', width: 100, sorter: true, sortType: 'number' },
        { title: t('population'), dataIndex: 'population', align: 'right', width: 100, sorter: true, sortType: 'number' },
        { title: t('gdpPerCapita'), dataIndex: 'gdpPerCapita', align: 'right', width: 200, sorter: true, sortType: 'number' },
    ];
    const [dataSource, setDataSource] = useState<any[]>(getDataSource2());

    function updateArea0() {
        const dataSourceTemp = dataSource.slice();
        Object.assign(dataSourceTemp[0], {
            gdp: Math.round(Math.random() * 100000),
            population: Math.round(Math.random() * 10000000),
            gdpPerCapita: Math.round(Math.random() * 200000),
        });
        setDataSource(dataSourceTemp);
        stkTableRef.current?.setHighlightDimRow([dataSourceTemp[0].area]);
    }

    function updateArea0_0() {
        const dataSourceTemp = dataSource.slice();
        const area1_0 = dataSourceTemp[0].children[0];
        Object.assign(area1_0, {
            gdp: Math.round(Math.random() * 100000),
            population: Math.round(Math.random() * 10000000),
            gdpPerCapita: Math.round(Math.random() * 200000),
        });
        setDataSource(dataSourceTemp);
        stkTableRef.current?.setHighlightDimRow([area1_0.area]);
    }

    function updateArea0_1Cell() {
        const dataSourceTemp = dataSource.slice();
        const area0_1 = dataSourceTemp[0].children[1];
        area0_1.gdp = Math.round(Math.random() * 100000);
        setDataSource(dataSourceTemp);
        stkTableRef.current?.setHighlightDimCell(area0_1.area, 'gdp');
    }

    return (
        <div>
            <button className="btn" onClick={updateArea0}>
                update Area0
            </button>
            <button className="btn" onClick={updateArea0_0}>
                update Area0-0
            </button>
            <button className="btn" onClick={updateArea0_1Cell}>
                update Area0-1 gdp
            </button>
            <StkTable ref={stkTableRef} style={{ height: '200px' }} rowKey="area" virtual columns={columns} dataSource={dataSource} />
        </div>
    );
}
