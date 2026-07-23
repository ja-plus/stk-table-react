import { useRef } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../src/StkTable';

type DataType = {
    key: string;
    name: string;
    age: number;
    score: number;
    department: string;
};

const columns: StkTableColumn<DataType>[] = [
    { title: 'No.', dataIndex: '' as any, type: 'seq', width: 50 },
    { title: 'Name', dataIndex: 'name', sorter: true, width: 120 },
    { title: 'Age', dataIndex: 'age', sorter: true, sortType: 'number', width: 100 },
    { title: 'Score', dataIndex: 'score', sorter: true, sortType: 'number', width: 100 },
    { title: 'Department', dataIndex: 'department', sorter: true, width: 120 },
];

const dataSource: DataType[] = [
    { key: '1', name: 'Alice', age: 25, score: 85, department: 'Engineering' },
    { key: '2', name: 'Bob', age: 30, score: 92, department: 'Sales' },
    { key: '3', name: 'Charlie', age: 25, score: 78, department: 'Engineering' },
    { key: '4', name: 'David', age: 30, score: 85, department: 'Marketing' },
    { key: '5', name: 'Eve', age: 25, score: 92, department: 'Sales' },
    { key: '6', name: 'Frank', age: 35, score: 78, department: 'Engineering' },
    { key: '7', name: 'Grace', age: 30, score: 85, department: 'Marketing' },
    { key: '8', name: 'Henry', age: 25, score: 78, department: 'Sales' },
    { key: '9', name: 'Ivy', age: 35, score: 92, department: 'Engineering' },
    { key: '10', name: 'Jack', age: 30, score: 78, department: 'Marketing' },
];

const sortConfig = {
    multiSort: true,
    multiSortLimit: 3,
};

export default function MultiSort() {
    const stkTableRef = useRef<StkTableRef<DataType>>(null);

    function getSortInfo() {
        const sortColumns = stkTableRef.current?.getSortColumns();
        const sortStates = stkTableRef.current?.sortStates();
        alert(`Current Sort: ${JSON.stringify(sortColumns, null, 2)}, \nSort States: ${JSON.stringify(sortStates, null, 2)}`);
    }

    // 使用 setSorter 设置多列排序
    function setMultiSort() {
        // 先按 Department 升序，再按 Age 降序
        stkTableRef.current?.setSorter('department', 'asc');
        stkTableRef.current?.setSorter('age', 'desc', { append: true });
    }

    // 使用 setSorter 设置单列排序（在多列排序模式下会清除其他排序）
    function setSingleSort() {
        stkTableRef.current?.setSorter('score', 'desc');
    }

    // 重置排序
    function resetSort() {
        stkTableRef.current?.resetSorter();
    }

    return (
        <div className="multi-sort-demo">
            <style>{`
                .multi-sort-demo { padding: 16px; }
                .multi-sort-demo .toolbar { margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
            `}</style>
            <div className="toolbar">
                <button className="btn" onClick={setMultiSort}>
                    Set (Age↓, Dept↑)
                </button>
                <button className="btn" onClick={setSingleSort}>
                    Set (Score↓)
                </button>
                <button className="btn" onClick={getSortInfo}>
                    Get Sort Info
                </button>
                <button className="btn" onClick={resetSort}>
                    Reset
                </button>
            </div>

            <StkTable ref={stkTableRef} style={{ height: '200px' }} rowKey="key" sortConfig={sortConfig} columns={columns} dataSource={dataSource} />
        </div>
    );
}
