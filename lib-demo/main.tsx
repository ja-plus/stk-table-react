import { useState } from 'react';
import { createRoot } from 'react-dom/client';
// Import from the BUILT lib output, exactly like an end user would consume the package.
import { StkTable } from '../lib/stk-table-react.js';
import '../lib/style.css';

const columns: any[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name', width: 150 },
    { title: 'Age', dataIndex: 'age', width: 100, align: 'right' },
    { title: 'Address', dataIndex: 'address', width: 250 },
];

function LibDemo() {
    const [dataSource] = useState(
        Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `User_${i}`,
            age: 20 + (i % 40),
            address: `Street ${i}, City ${i % 5}`,
        })),
    );

    return (
        <div style={{ padding: 16 }}>
            <h2>stk-table-react — consume built lib artifact</h2>
            <p>
                This demo imports <code>StkTable</code> from <code>../lib/stk-table-react.js</code> (the build output).
            </p>
            <div style={{ height: 400, border: '1px solid #ccc' }}>
                <StkTable rowKey="id" virtual bordered columns={columns} dataSource={dataSource} style={{ height: '100%' }} />
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<LibDemo />);
