import { useMemo } from 'react';
import mockjs from 'mockjs';
import { StkTable } from '../../../StkTable';
import type { StkTableColumn } from '../../../../src/StkTable/index';
import { useI18n } from '../../../hooks/useI18n/index';
import Panel from './Panel';
import type { DataType } from './types';

export default function AutoHeightVirtualList() {
    const { isZH } = useI18n();

    const columns: StkTableColumn<DataType>[] = useMemo(() => [{ dataIndex: 'title', title: '', customCell: Panel }], []);

    const data = useMemo(
        () =>
            new Array(10).fill(0).map((_, i) => ({
                id: i,
                title: isZH ? mockjs.Random.csentence(3, 15) : mockjs.Random.sentence(1, 5),
                content: isZH ? mockjs.Random.cparagraph(0.5, 20) : mockjs.Random.paragraph(1, 20),
                date: isZH ? mockjs.Random.datetime('yyyy-MM-dd HH:mm') : mockjs.Random.datetime('MM/dd/yyyy HH:mm'),
            })),
        [isZH],
    );

    return (
        <>
            <StkTable
                rowKey="id"
                style={{ height: 400 }}
                virtual
                headless
                autoRowHeight={{
                    expectedHeight: 200,
                }}
                rowHeight={200}
                rowActive={false}
                bordered={false}
                rowHover={false}
                columns={columns}
                dataSource={data}
            ></StkTable>
            <style>{`
                .v-head { background-color: #333; font-weight: bold; }
                .panel { padding: 16px; border-radius: 5px; box-shadow: 0 2px 4px 2px rgba(200, 200, 200, 0.4); display: flex; flex-direction: column; margin: 10px 0; }
                .panel header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                .panel article { text-indent: 2em; margin-bottom: 10px; flex: 1; }
                .panel footer { font-size: 12px; text-align: right; color: #aaa; }
            `}</style>
        </>
    );
}
