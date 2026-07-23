import mockjs from 'mockjs';
import { StkTable } from '../../../StkTable';
import type { StkTableColumn } from '../../../../src/StkTable/index';
import type { DataType } from './types';
import { getIsZH } from '../../../hooks/getIsZH';

const isZH = getIsZH();

const columns: StkTableColumn<DataType>[] = [
    { dataIndex: 'id', title: 'ID', width: 26, align: 'center' },
    { dataIndex: 'title', title: 'Title', width: 100 },
    { dataIndex: 'content', title: 'Content', width: 200 },
    { dataIndex: 'date', title: 'Date', width: 70, align: 'center' },
];
const data = new Array(50).fill(0).map((_, i) => ({
    id: i,
    title: isZH ? mockjs.Random.csentence(1, 5) : mockjs.Random.sentence(1, 5),
    content: isZH ? mockjs.Random.cparagraph(2, 15) : mockjs.Random.paragraph(1, 5),
    date: isZH ? mockjs.Random.datetime('yyyy-MM-dd HH:mm') : mockjs.Random.datetime('MM/dd/yyyy HH:mm'),
}));

export default function AutoHeightVirtualDemo() {
    return (
        <div className="auto-height-virtual-demo">
            <StkTable
                rowKey="id"
                style={{ height: 400 }}
                stripe
                virtual
                autoRowHeight
                rowHeight={50}
                columns={columns}
                dataSource={data}
            />
            <style>{`
.auto-height-virtual-demo .v-head {
    background-color: #333;
    font-weight: bold;
}
`}</style>
        </div>
    );
}
