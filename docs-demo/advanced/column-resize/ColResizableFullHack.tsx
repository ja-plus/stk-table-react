import { useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';

export default function ColResizableFullHack() {
    const [columns, setColumns] = useState<StkTableColumn<any>[]>([
        { title: 'Name', dataIndex: 'name', width: 100, fixed: 'left' },
        { title: 'Age', dataIndex: 'age', width: 60 },
        { title: 'Gender', dataIndex: 'gender', width: 80 },
        { title: 'Address', dataIndex: 'address', width: 200 },
        { title: 'min-width: 120', dataIndex: 'op', minWidth: 120 },
    ]);

    const dataSource = [
        {
            name: `Jack`,
            age: 18,
            address: `Beijing Forbidden City, ${' Long text'.repeat(20)}`,
            gender: 'male',
        },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
        ...new Array(100).fill(0).map((_, i) => ({
            name: `Jack${i}`,
            age: 18,
            address: `Beijing Forbidden City `,
            gender: 'male',
        })),
    ];

    return (
        <div className="col-resizable-full-hack">
            <style>{`.col-resizable-full-hack .stk-table-main { flex: 1 !important; }`}</style>
            <StkTable
                columns={columns}
                onUpdateColumns={newCols => setColumns(newCols as StkTableColumn<any>[])}
                rowKey="name"
                style={{ height: '200px' }}
                virtual
                colResizable={{
                    disabled: col => col.dataIndex === 'op',
                }}
                fixedColShadow
                dataSource={dataSource}
            />
        </div>
    );
}
