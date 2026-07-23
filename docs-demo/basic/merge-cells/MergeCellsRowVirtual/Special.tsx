import { StkTable } from '../../../StkTable';
import type { StkTableColumn } from '../../../../src/StkTable';
import { specialDataSource } from './dataSource';

function mergeCells({ row, col }: { row: any; col: StkTableColumn<any> }) {
    if (!row.rowspan) return;
    return { rowspan: row.rowspan[col.dataIndex] || 1 };
}

const columns: StkTableColumn<any>[] = [
    { title: 'ID', dataIndex: 'id', width: 50, align: 'center' },
    { title: 'A', dataIndex: 'a', width: 100, mergeCells },
    { title: 'B', dataIndex: 'b', width: 120, mergeCells },
    { title: 'C', dataIndex: 'c', mergeCells },
];

export default function Special() {
    return <StkTable style={{ maxHeight: '300px' }} virtual cellHover rowKey="id" columns={columns} dataSource={specialDataSource} />;
}
