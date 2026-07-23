import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StkTable } from '../StkTable';
import { StkTableColumn } from '../types';
import '../style.less';

// ===== Basic Demo =====
function BasicDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Age', dataIndex: 'age', width: 100 },
        { title: 'Address', dataIndex: 'address', width: 200 },
        { title: 'Email', dataIndex: 'email', width: 250 },
    ];
    const dataSource = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `User_${i}`,
        age: 20 + (i % 40),
        address: `Street ${i}, City ${i % 5}`,
        email: `user${i}@example.com`,
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" stripe bordered />
        </div>
    );
}

// ===== Sort Demo =====
function SortDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'ID', dataIndex: 'id', width: 80, sorter: true },
        { title: 'Name', dataIndex: 'name', width: 150, sorter: true },
        { title: 'Score', dataIndex: 'score', width: 100, sorter: true, sortType: 'number' },
    ];
    const dataSource = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        name: `Student_${String.fromCharCode(65 + (i % 26))}`,
        score: Math.floor(Math.random() * 100),
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" bordered />
        </div>
    );
}

// ===== Fixed Column Demo =====
function FixedColDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'Fixed Left', dataIndex: 'id', width: 100, fixed: 'left' },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Col1', dataIndex: 'col1', width: 200 },
        { title: 'Col2', dataIndex: 'col2', width: 200 },
        { title: 'Col3', dataIndex: 'col3', width: 200 },
        { title: 'Col4', dataIndex: 'col4', width: 200 },
        { title: 'Fixed Right', dataIndex: 'action', width: 120, fixed: 'right' },
    ];
    const dataSource = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        name: `User_${i}`,
        col1: `data-${i}-1`,
        col2: `data-${i}-2`,
        col3: `data-${i}-3`,
        col4: `data-${i}-4`,
        action: 'Edit',
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" bordered />
        </div>
    );
}

// ===== Virtual Scroll Demo =====
function VirtualScrollDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Value', dataIndex: 'value', width: 150 },
    ];
    const dataSource = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: `Row_${i}`,
        value: `Value_${i}`,
    }));
    return (
        <div className="demo-box" style={{ height: 400 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" virtual bordered />
        </div>
    );
}

// ===== Tree Demo =====
function TreeDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'Name', dataIndex: 'name', width: 300, type: 'tree-node' },
        { title: 'Size', dataIndex: 'size', width: 100 },
        { title: 'Type', dataIndex: 'type', width: 100 },
    ];
    const dataSource = [
        {
            id: '1',
            name: 'src',
            size: '-',
            type: 'folder',
            children: [
                {
                    id: '1-1',
                    name: 'components',
                    size: '-',
                    type: 'folder',
                    children: [
                        { id: '1-1-1', name: 'Button.tsx', size: '2KB', type: 'file' },
                        { id: '1-1-2', name: 'Input.tsx', size: '3KB', type: 'file' },
                    ],
                },
                { id: '1-2', name: 'index.ts', size: '1KB', type: 'file' },
            ],
        },
        {
            id: '2',
            name: 'public',
            size: '-',
            type: 'folder',
            children: [{ id: '2-1', name: 'index.html', size: '1KB', type: 'file' }],
        },
        { id: '3', name: 'package.json', size: '2KB', type: 'file' },
    ];
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" bordered />
        </div>
    );
}

// ===== Expand Row Demo =====
function ExpandRowDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: '', dataIndex: 'expand', type: 'expand', width: 40 },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Age', dataIndex: 'age', width: 100 },
    ];
    const dataSource = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `User_${i}`,
        age: 20 + i,
        expand: `This is the expanded content for User_${i}. It contains detailed information.`,
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                bordered
                renderExpand={row => <div style={{ padding: 12, background: '#f5f5f5' }}>{row.expand}</div>}
            />
        </div>
    );
}

// ===== Multi Header Demo =====
function MultiHeaderDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        {
            title: 'Info',
            dataIndex: 'info',
            children: [
                { title: 'Name', dataIndex: 'name', width: 150 },
                { title: 'Age', dataIndex: 'age', width: 100 },
            ],
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            children: [
                { title: 'Email', dataIndex: 'email', width: 200 },
                { title: 'Phone', dataIndex: 'phone', width: 150 },
            ],
        },
    ];
    const dataSource = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `User_${i}`,
        age: 20 + i,
        email: `user${i}@test.com`,
        phone: `138${String(i).padStart(8, '0')}`,
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" bordered />
        </div>
    );
}

// ===== Col Resize Demo =====
function ColResizeDemo() {
    const [cols, setCols] = useState<StkTableColumn<any>[]>([
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Age', dataIndex: 'age', width: 100 },
        { title: 'Address', dataIndex: 'address', width: 250 },
    ]);
    const dataSource = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `User_${i}`,
        age: 20 + i,
        address: `Street ${i}`,
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={cols} dataSource={dataSource} rowKey="id" bordered colResizable onUpdateColumns={newCols => setCols(newCols as any)} />
        </div>
    );
}

// ===== Dark Theme Demo =====
function DarkThemeDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Status', dataIndex: 'status', width: 100 },
    ];
    const dataSource = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Task_${i}`,
        status: i % 2 === 0 ? 'Active' : 'Inactive',
    }));
    return (
        <div className="demo-box" style={{ height: 300, borderColor: '#333', background: '#1b1b24' }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" theme="dark" bordered stripe />
        </div>
    );
}

// ===== Seq + Row Active Demo =====
function SeqRowActiveDemo() {
    const columns: StkTableColumn<any>[] = [
        { title: '#', dataIndex: 'seq', type: 'seq', width: 50 },
        { title: 'Name', dataIndex: 'name', width: 150 },
        { title: 'Score', dataIndex: 'score', width: 100 },
    ];
    const dataSource = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        name: `Player_${i}`,
        score: Math.floor(Math.random() * 100),
    }));
    return (
        <div className="demo-box" style={{ height: 300 }}>
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" bordered rowActive stripe />
        </div>
    );
}

// ===== Main App =====
function App() {
    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h1>StkTable React - Feature Demos</h1>

            <h2>1. Basic Table (Stripe + Bordered)</h2>
            <BasicDemo />

            <h2>2. Sort</h2>
            <SortDemo />

            <h2>3. Fixed Columns</h2>
            <FixedColDemo />

            <h2>4. Virtual Scroll (100,000 rows)</h2>
            <VirtualScrollDemo />

            <h2>5. Tree Data</h2>
            <TreeDemo />

            <h2>6. Expand Row</h2>
            <ExpandRowDemo />

            <h2>7. Multi-Level Header</h2>
            <MultiHeaderDemo />

            <h2>8. Column Resize</h2>
            <ColResizeDemo />

            <h2>9. Dark Theme</h2>
            <DarkThemeDemo />

            <h2>10. Seq + Row Active</h2>
            <SeqRowActiveDemo />
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
