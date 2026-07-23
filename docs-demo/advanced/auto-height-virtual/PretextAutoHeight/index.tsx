import { useCallback, useEffect, useRef } from 'react';
import { layout, prepare } from '@chenglou/pretext';
import mockjs from 'mockjs';
import { StkTable } from '../../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../../src/StkTable/index';
import type { DataType } from './types';
import { getIsZH } from '../../../hooks/getIsZH';

const isZH = getIsZH();

const columns: StkTableColumn<DataType>[] = [
    { dataIndex: 'id', title: 'ID', width: 26, align: 'center' },
    { dataIndex: 'content', title: 'Content', width: 200 },
    { dataIndex: 'date', title: 'Date', width: 70, align: 'center' },
];

const data = new Array(100).fill(0).map((_, i) => ({
    id: i,
    content: isZH ? mockjs.Random.cparagraph(1, 8) : mockjs.Random.paragraph(1, 3),
    date: isZH ? mockjs.Random.datetime('yyyy-MM-dd') : mockjs.Random.datetime('MM/dd/yyyy'),
}));

/**
 * 使用 pretext 计算文本在指定宽度下的高度
 */
function calculateHeightWithPretext(text: string, width: number): number {
    const prepared = prepare(text, '14px system-ui');
    const { height } = layout(prepared, width, 20);
    return Math.max(height + 16, 36); // 加上 cell padding
}

export default function PretextAutoHeightDemo() {
    const stkTableRef = useRef<StkTableRef<DataType>>(null);

    /**
     * 预计算所有行的行高
     */
    const preCalculateAllRowHeights = useCallback(() => {
        // 通过 DOM 获取第一个单元格的实际宽度
        const firstCell = document.querySelector('.pretext-table [data-col-key="content"] .table-cell-wrapper');
        const contentColumnWidth = firstCell ? (firstCell as HTMLElement).clientWidth : 184;
        data.forEach(row => {
            const height = calculateHeightWithPretext(row.content, contentColumnWidth);
            stkTableRef.current?.setAutoHeight(row.id, height);
        });
    }, []);

    useEffect(() => {
        preCalculateAllRowHeights();
    }, [preCalculateAllRowHeights]);

    const autoResize = useCallback(() => {
        preCalculateAllRowHeights();
    }, [preCalculateAllRowHeights]);

    return (
        <div className="pretext-auto-height-demo">
            <StkTable
                ref={stkTableRef}
                className="pretext-table"
                rowKey="id"
                style={{ height: 400 }}
                stripe
                virtual
                autoRowHeight
                rowHeight={50}
                columns={columns}
                dataSource={data}
                autoResize={autoResize}
            />
            <style>{`
.pretext-auto-height-demo .v-head {
    background-color: #333;
    font-weight: bold;
}
.pretext-auto-height-demo .stk-table {
    line-height: 20px;
}
`}</style>
        </div>
    );
}
