import { StkTable } from '../../../StkTable';
import type { StkTableColumn } from '../../../../src/StkTable';
import type { DataType } from './types';
import YieldCell from './YieldCell';

const columns: StkTableColumn<DataType>[] = [
    { title: 'Code', dataIndex: 'code' },
    { title: 'Yield Rate', dataIndex: 'yield', align: 'right', customCell: YieldCell },
];

const dataSource: DataType[] = [
    { code: '000001', yield: 0.05352 },
    { code: '000002', yield: -0.03524 },
    { code: '000003', yield: 0.024982 },
    { code: '000004', yield: -0.014415 },
    { code: '000005', yield: 0.045481 },
    { code: '000006', yield: 0 },
];

export default function CustomCell() {
    return (
        <div>
            <style>{`
                .color-up { color: #2fc87b; }
                .color-down { color: #ff2b48; }
            `}</style>
            <StkTable rowKey="code" columns={columns} dataSource={dataSource} />
        </div>
    );
}
