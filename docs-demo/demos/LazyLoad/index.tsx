import { useEffect, useMemo, useRef, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable/index';
import { debounce } from '../../../src/StkTable/utils/index';

const totalCount = 100_000;
const pageSize = 100;

const columns: StkTableColumn<Record<string, any>>[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name', width: 120 },
    { title: 'Age', dataIndex: 'age', width: 80 },
    { title: 'Address', dataIndex: 'address', width: 300 },
];

function createPlaceholders() {
    const placeholders: Array<Record<string, any>> = [];
    for (let i = 0; i < totalCount; i++) {
        placeholders.push({
            id: i + 1,
            __placeholder: true,
        });
    }
    return placeholders;
}

function mockFetchData(page: number, size: number): Promise<Array<Record<string, any>>> {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = [];
            const start = page * size;
            for (let i = 0; i < size; i++) {
                const index = start + i;
                if (index < totalCount) {
                    data.push({
                        id: index + 1,
                        name: `User${index + 1}`,
                        age: 20 + (index % 50),
                        address: `Beijing Chaoyang District${index + 1} Street`,
                        __placeholder: false,
                    });
                }
            }
            resolve(data);
        }, 200); // delay
    });
}

export default function LazyLoadDemo() {
    const tableDataRef = useRef<Array<Record<string, any>>>(null as any);
    if (!tableDataRef.current) {
        tableDataRef.current = createPlaceholders();
    }
    const loadedPagesRef = useRef<Set<number>>(new Set());

    const [tableData, setTableData] = useState<Array<Record<string, any>>>(tableDataRef.current);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);

    const loadedCount = useMemo(() => {
        return tableData.filter(item => !item.__placeholder).length;
    }, [tableData]);

    async function loadDataPage(page: number) {
        if (loadedPagesRef.current.has(page)) return;

        loadedPagesRef.current.add(page);

        try {
            const response = await mockFetchData(page, pageSize);

            const start = page * pageSize;
            response.forEach((item, index) => {
                if (start + index < tableDataRef.current.length) {
                    tableDataRef.current[start + index] = item;
                }
            });

            setTableData(tableDataRef.current.slice());
        } catch (error) {
            loadedPagesRef.current.delete(page);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onScroll = useMemo(
        () =>
            debounce((e: Event, data: { startIndex: number; endIndex: number }) => {
                setStartIndex(data.startIndex);
                setEndIndex(data.endIndex);

                const startPage = Math.floor(data.startIndex / pageSize);
                const endPage = Math.floor(data.endIndex / pageSize);

                for (let page = startPage; page <= endPage; page++) {
                    if (page >= 0 && page < Math.ceil(totalCount / pageSize)) {
                        loadDataPage(page);
                    }
                }
            }, 300),
        [],
    );

    function gcData() {
        const startPage = Math.floor(startIndex / pageSize);
        const endPage = Math.floor(endIndex / pageSize);

        const keepStartPage = Math.max(0, startPage - 1);
        const keepEndPage = Math.min(Math.ceil(totalCount / pageSize) - 1, endPage + 1);

        loadedPagesRef.current.forEach(page => {
            if (page < keepStartPage || page > keepEndPage) {
                const pageStartIndex = page * pageSize;
                const pageEndIndex = Math.min(pageStartIndex + pageSize, totalCount);

                for (let i = pageStartIndex; i < pageEndIndex; i++) {
                    tableDataRef.current[i] = {
                        id: i + 1,
                        __placeholder: true,
                    };
                }
                // remove page from loadedPages
                loadedPagesRef.current.delete(page);
            }
        });

        setTableData(tableDataRef.current.slice());
    }

    useEffect(() => {
        loadDataPage(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <header>
                <button className="btn" onClick={gcData}>
                    GC
                </button>
            </header>
            <StkTable
                rowKey="id"
                style={{ height: 400 }}
                virtual
                scrollbar
                columns={columns}
                dataSource={tableData}
                onScroll={onScroll}
            />
            <footer style={{ marginTop: 16 }}>
                <span>Total: {totalCount}</span>
                <span style={{ marginLeft: 16 }}>Page Size: {pageSize}</span>
                <span style={{ marginLeft: 16 }}>Loaded Count: {loadedCount}</span>
                <span style={{ marginLeft: 16 }}>
                    startIndex: {startIndex} endIndex: {endIndex}
                </span>
            </footer>
        </div>
    );
}
