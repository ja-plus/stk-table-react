import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';

interface Data {
    id: number;
    product: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
}

const columns: StkTableColumn<Data>[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Product', dataIndex: 'product', width: 120 },
    {
        title: 'Sales by Quarter',
        dataIndex: 'sales' as any, // 父级列不需要实际的 dataIndex，但类型要求
        children: [
            { title: 'Q1', dataIndex: 'q1', align: 'right' },
            { title: 'Q2', dataIndex: 'q2', align: 'right' },
            { title: 'Q3', dataIndex: 'q3', align: 'right' },
            { title: 'Q4', dataIndex: 'q4', align: 'right' },
        ],
    },
];

const dataSource: Data[] = [
    { id: 1, product: 'Product A', q1: 100, q2: 150, q3: 200, q4: 180 },
    { id: 2, product: 'Product B', q1: 80, q2: 120, q3: 90, q4: 110 },
    { id: 3, product: 'Product C', q1: 200, q2: 180, q3: 220, q4: 250 },
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 4,
        product: `Product ${i + 4}`,
        q1: Math.floor(Math.random() * 100),
        q2: Math.floor(Math.random() * 100),
        q3: Math.floor(Math.random() * 100),
        q4: Math.floor(Math.random() * 100),
    })),
];

const footerData: Data[] = [{ id: 0, product: 'Total', q1: 380, q2: 450, q3: 510, q4: 540 }];

export default function FooterMultiHeader() {
    const [isFooterTop, setIsFooterTop] = useState(true);

    return (
        <div>
            <div>
                <button className="btn" onClick={() => setIsFooterTop(v => !v)}>
                    Position: {isFooterTop ? 'top' : 'bottom'}
                </button>
            </div>
            <StkTable
                style={{ height: '250px' }}
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
                footerData={footerData}
                footerConfig={{ position: isFooterTop ? 'top' : 'bottom' }}
            />
        </div>
    );
}
