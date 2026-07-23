import { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StkTable } from '../StkTable';
import { StkTableRef, StkTableColumn } from '../types';

// Mock requestAnimationFrame
beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
    });
});

// Helper: generate columns
function getColumns(count = 5): StkTableColumn<any>[] {
    return Array.from({ length: count }, (_, i) => ({
        title: `Col${i}`,
        dataIndex: `col${i}`,
        width: 100,
    }));
}

// Helper: generate data
function getData(count = 20): any[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        col0: `val-${i}-0`,
        col1: `val-${i}-1`,
        col2: `val-${i}-2`,
        col3: `val-${i}-3`,
        col4: `val-${i}-4`,
    }));
}

describe('StkTable React - Basic Rendering', () => {
    it('renders table with columns and data', () => {
        const columns = getColumns();
        const dataSource = getData(5);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(container.querySelector('.stk-table')).toBeInTheDocument();
        expect(container.querySelectorAll('thead th').length).toBe(5);
        expect(container.querySelectorAll('tbody tr').length).toBe(5);
    });

    it('renders header titles correctly', () => {
        const columns = getColumns(3);
        const dataSource = getData(2);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const ths = container.querySelectorAll('thead th');
        expect(ths[0].textContent).toContain('Col0');
        expect(ths[1].textContent).toContain('Col1');
        expect(ths[2].textContent).toContain('Col2');
    });

    it('renders cell data correctly', () => {
        const columns = getColumns(2);
        const dataSource = [{ id: 0, col0: 'hello', col1: 'world' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const tds = container.querySelectorAll('tbody td');
        expect(tds[0].textContent).toBe('hello');
        expect(tds[1].textContent).toBe('world');
    });

    it('renders empty text when no data', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={[]} rowKey="id" />);
        expect(container.querySelector('.stk-table-no-data')).toBeInTheDocument();
        expect(container.querySelector('.stk-table-no-data')?.textContent).toBe('暂无数据');
    });

    it('renders custom empty text', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={[]} rowKey="id" renderEmpty={() => <span>No records</span>} />);
        expect(container.querySelector('.stk-table-no-data')?.textContent).toBe('No records');
    });

    it('hides no-data when showNoData is false', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={[]} rowKey="id" showNoData={false} />);
        expect(container.querySelector('.stk-table-no-data')).toBeNull();
    });

    it('renders empty cell text for null values', () => {
        const columns = getColumns(2);
        const dataSource = [{ id: 0, col0: null, col1: undefined }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" emptyCellText="--" />);
        const tds = container.querySelectorAll('tbody td');
        expect(tds[0].textContent).toBe('--');
        expect(tds[1].textContent).toBe('--');
    });

    it('applies theme class', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={[]} rowKey="id" theme="dark" />);
        expect(container.querySelector('.stk-table.dark')).toBeInTheDocument();
    });

    it('applies stripe class', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" stripe />);
        expect(container.querySelector('.stk-table.stripe')).toBeInTheDocument();
    });

    it('applies bordered class', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" bordered />);
        expect(container.querySelector('.stk-table.bordered')).toBeInTheDocument();
    });

    it('headless mode hides thead', () => {
        const columns = getColumns();
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" headless />);
        expect(container.querySelector('thead')).toBeNull();
        expect(container.querySelector('.stk-table.headless')).toBeInTheDocument();
    });
});

describe('StkTable React - Seq Column', () => {
    it('renders sequence numbers', () => {
        const columns: StkTableColumn<any>[] = [
            { title: 'Seq', dataIndex: 'seq', type: 'seq', width: 50 },
            { title: 'Name', dataIndex: 'name', width: 100 },
        ];
        const dataSource = [
            { id: 0, name: 'Alice' },
            { id: 1, name: 'Bob' },
            { id: 2, name: 'Charlie' },
        ];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const seqCells = container.querySelectorAll('.seq-column');
        expect(seqCells.length).toBe(3);
        expect(seqCells[0].textContent).toBe('1');
        expect(seqCells[1].textContent).toBe('2');
        expect(seqCells[2].textContent).toBe('3');
    });

    it('renders seq with custom startIndex', () => {
        const columns: StkTableColumn<any>[] = [
            { title: 'Seq', dataIndex: 'seq', type: 'seq', width: 50 },
            { title: 'Name', dataIndex: 'name', width: 100 },
        ];
        const dataSource = [{ id: 0, name: 'Alice' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" seqConfig={{ startIndex: 10 }} />);
        const seqCell = container.querySelector('.seq-column');
        expect(seqCell?.textContent).toBe('11');
    });
});

describe('StkTable React - Sorting', () => {
    it('sorts data ascending on column click', () => {
        const columns: StkTableColumn<any>[] = [{ title: 'Name', dataIndex: 'name', width: 100, sorter: true }];
        const dataSource = [
            { id: 0, name: 'Charlie' },
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];
        const onSortChange = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" onSortChange={onSortChange} />);
        const th = container.querySelector('th.sortable');
        expect(th).toBeInTheDocument();
        fireEvent.click(th!);
        expect(onSortChange).toHaveBeenCalled();
        const tds = container.querySelectorAll('tbody td');
        // After first click -> desc
        expect(tds[0].textContent).toBe('Charlie');
        expect(tds[1].textContent).toBe('Bob');
        expect(tds[2].textContent).toBe('Alice');
    });

    it('cycles sort order: null -> desc -> asc -> null', () => {
        const columns: StkTableColumn<any>[] = [{ title: 'Val', dataIndex: 'val', width: 100, sorter: true }];
        const dataSource = [
            { id: 0, val: 3 },
            { id: 1, val: 1 },
            { id: 2, val: 2 },
        ];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const th = container.querySelector('th.sortable')!;

        // Click 1: desc
        fireEvent.click(th);
        let tds = container.querySelectorAll('tbody td');
        expect(tds[0].textContent).toBe('3');

        // Click 2: asc
        fireEvent.click(th);
        tds = container.querySelectorAll('tbody td');
        expect(tds[0].textContent).toBe('1');

        // Click 3: null (back to original)
        fireEvent.click(th);
        tds = container.querySelectorAll('tbody td');
        expect(tds[0].textContent).toBe('3');
    });

    it('renders sort icon for sortable columns', () => {
        const columns: StkTableColumn<any>[] = [
            { title: 'Name', dataIndex: 'name', width: 100, sorter: true },
            { title: 'Age', dataIndex: 'age', width: 100 },
        ];
        const { container } = render(<StkTable columns={columns} dataSource={getData(2)} rowKey="id" />);
        expect(container.querySelector('th.sortable .table-header-sorter')).toBeInTheDocument();
        expect(container.querySelectorAll('.table-header-sorter').length).toBe(1);
    });
});

describe('StkTable React - Row Active/Click', () => {
    it('highlights row on click', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" rowActive />);
        const firstRow = container.querySelectorAll('tbody tr')[0];
        fireEvent.click(firstRow);
        expect(firstRow.classList.contains('active')).toBe(true);
    });

    it('calls onRowClick callback', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const onRowClick = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" onRowClick={onRowClick} />);
        const firstRow = container.querySelectorAll('tbody tr')[0];
        fireEvent.click(firstRow);
        expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    it('calls onCurrentChange callback', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const onCurrentChange = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" rowActive onCurrentChange={onCurrentChange} />);
        const firstRow = container.querySelectorAll('tbody tr')[0];
        fireEvent.click(firstRow);
        expect(onCurrentChange).toHaveBeenCalledTimes(1);
    });

    it('revokes active row on second click when revokable', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const { container } = render(
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" rowActive={{ enabled: true, revokable: true }} />,
        );
        const firstRow = container.querySelectorAll('tbody tr')[0];
        fireEvent.click(firstRow);
        expect(firstRow.classList.contains('active')).toBe(true);
        fireEvent.click(firstRow);
        expect(firstRow.classList.contains('active')).toBe(false);
    });
});

describe('StkTable React - Cell Active', () => {
    it('highlights cell on click when cellActive is true', () => {
        const columns = getColumns(3);
        const dataSource = getData(3);
        const onCellSelected = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" cellActive onCellSelected={onCellSelected} />);
        const firstCell = container.querySelectorAll('tbody td')[0];
        fireEvent.click(firstCell);
        expect(onCellSelected).toHaveBeenCalled();
        expect(firstCell.classList.contains('active')).toBe(true);
    });
});

describe('StkTable React - Custom Cell', () => {
    it('renders custom cell component', () => {
        const CustomCell = (props: any) => <span className="custom">{props.cellValue}-custom</span>;
        const columns: StkTableColumn<any>[] = [{ title: 'Name', dataIndex: 'name', width: 100, customCell: CustomCell }];
        const dataSource = [{ id: 0, name: 'Test' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(container.querySelector('.custom')?.textContent).toBe('Test-custom');
    });
});

describe('StkTable React - Custom Header', () => {
    it('renders custom header via renderHeader', () => {
        const columns = getColumns(2);
        const { container } = render(
            <StkTable columns={columns} dataSource={getData(2)} rowKey="id" renderHeader={col => <em className="custom-header">{col.title}!</em>} />,
        );
        expect(container.querySelector('.custom-header')?.textContent).toBe('Col0!');
    });
});

describe('StkTable React - Tree Data', () => {
    it('renders tree data with expand/collapse', () => {
        const columns: StkTableColumn<any>[] = [{ title: 'Name', dataIndex: 'name', width: 200, type: 'tree-node' }];
        const dataSource = [
            {
                id: '1',
                name: 'Parent',
                children: [
                    { id: '1-1', name: 'Child1' },
                    { id: '1-2', name: 'Child2' },
                ],
            },
        ];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        // Initially collapsed - only parent visible
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBe(1);
        // Click expand icon
        const foldIcon = container.querySelector('.stk-fold-icon');
        expect(foldIcon).toBeInTheDocument();
        fireEvent.click(foldIcon!);
        // After expand - parent + 2 children
        const rowsAfter = container.querySelectorAll('tbody tr');
        expect(rowsAfter.length).toBe(3);
    });

    it('renders tree with defaultExpandAll', () => {
        const columns: StkTableColumn<any>[] = [{ title: 'Name', dataIndex: 'name', width: 200, type: 'tree-node' }];
        const dataSource = [
            {
                id: '1',
                name: 'Parent',
                children: [
                    { id: '1-1', name: 'Child1' },
                    { id: '1-2', name: 'Child2' },
                ],
            },
        ];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" treeConfig={{ defaultExpandAll: true }} />);
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBe(3);
    });
});

describe('StkTable React - Row Expand', () => {
    it('expands row on expand icon click', () => {
        const columns: StkTableColumn<any>[] = [
            { title: '', dataIndex: 'expand', type: 'expand', width: 40 },
            { title: 'Name', dataIndex: 'name', width: 100 },
        ];
        const dataSource = [{ id: 0, name: 'Alice', expand: 'Detail info' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(container.querySelectorAll('tbody tr').length).toBe(1);
        const foldIcon = container.querySelector('.stk-fold-icon');
        fireEvent.click(foldIcon!);
        expect(container.querySelectorAll('tbody tr').length).toBe(2);
        expect(container.querySelector('.expanded-row')).toBeInTheDocument();
    });

    it('renders custom expand content', () => {
        const columns: StkTableColumn<any>[] = [
            { title: '', dataIndex: 'expand', type: 'expand', width: 40 },
            { title: 'Name', dataIndex: 'name', width: 100 },
        ];
        const dataSource = [{ id: 0, name: 'Alice' }];
        const { container } = render(
            <StkTable
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                renderExpand={row => <div className="custom-expand">Expanded: {row.name}</div>}
            />,
        );
        const foldIcon = container.querySelector('.stk-fold-icon');
        fireEvent.click(foldIcon!);
        expect(container.querySelector('.custom-expand')?.textContent).toBe('Expanded: Alice');
    });
});

describe('StkTable React - Fixed Columns', () => {
    it('applies fixed-cell class to fixed columns', () => {
        const columns: StkTableColumn<any>[] = [
            { title: 'Fixed Left', dataIndex: 'col0', width: 100, fixed: 'left' },
            { title: 'Normal', dataIndex: 'col1', width: 100 },
            { title: 'Fixed Right', dataIndex: 'col2', width: 100, fixed: 'right' },
        ];
        const dataSource = getData(2);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const fixedCells = container.querySelectorAll('.fixed-cell');
        expect(fixedCells.length).toBeGreaterThan(0);
        expect(container.querySelectorAll('.fixed-cell--left').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('.fixed-cell--right').length).toBeGreaterThan(0);
    });
});

describe('StkTable React - Multi Header', () => {
    it('renders multi-level headers', () => {
        const columns: StkTableColumn<any>[] = [
            {
                title: 'Group',
                dataIndex: 'group',
                children: [
                    { title: 'Sub1', dataIndex: 'sub1', width: 100 },
                    { title: 'Sub2', dataIndex: 'sub2', width: 100 },
                ],
            },
            { title: 'Normal', dataIndex: 'normal', width: 100 },
        ];
        const dataSource = [{ id: 0, sub1: 'a', sub2: 'b', normal: 'c' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const headerRows = container.querySelectorAll('thead tr');
        expect(headerRows.length).toBe(2);
        // First row should have Group (colspan=2) + Normal (rowspan=2)
        const firstRowThs = headerRows[0].querySelectorAll('th');
        expect(firstRowThs[0].getAttribute('colspan')).toBe('2');
        expect(firstRowThs[1].getAttribute('rowspan')).toBe('2');
    });
});

describe('StkTable React - Footer', () => {
    it('renders footer data', () => {
        const columns = getColumns(3);
        const dataSource = getData(3);
        const footerData = [{ col0: 'Total', col1: '100', col2: '200' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" footerData={footerData} />);
        const footer = container.querySelector('.stk-footer');
        expect(footer).toBeInTheDocument();
        expect(footer?.textContent).toContain('Total');
    });
});

describe('StkTable React - Column Resize', () => {
    it('renders resize handles when colResizable is true', () => {
        const columns = getColumns(3);
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" colResizable />);
        expect(container.querySelector('.stk-table.col-resizable')).toBeInTheDocument();
        expect(container.querySelectorAll('.table-header-resizer').length).toBeGreaterThan(0);
    });

    it('renders resize indicator', () => {
        const columns = getColumns(3);
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" colResizable />);
        expect(container.querySelector('.column-resize-indicator')).toBeInTheDocument();
    });
});

describe('StkTable React - Header Drag', () => {
    it('makes headers draggable when headerDrag is true', () => {
        const columns = getColumns(3);
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" headerDrag />);
        const ths = container.querySelectorAll('thead th');
        expect(ths[0].getAttribute('draggable')).toBe('true');
    });

    it('does not make headers draggable when headerDrag is false', () => {
        const columns = getColumns(3);
        const { container } = render(<StkTable columns={columns} dataSource={getData(3)} rowKey="id" headerDrag={false} />);
        const ths = container.querySelectorAll('thead th');
        expect(ths[0].getAttribute('draggable')).not.toBe('true');
    });
});

describe('StkTable React - Row Drag', () => {
    it('renders drag handle for dragRow type column', () => {
        const columns: StkTableColumn<any>[] = [
            { title: '', dataIndex: 'drag', type: 'dragRow', width: 40 },
            { title: 'Name', dataIndex: 'name', width: 100 },
        ];
        const dataSource = [{ id: 0, name: 'Alice' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" dragRowConfig={{ mode: 'insert' }} />);
        expect(container.querySelector('.drag-row-handle')).toBeInTheDocument();
    });
});

describe('StkTable React - Row ClassName', () => {
    it('applies custom row class', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const { container } = render(
            <StkTable columns={columns} dataSource={dataSource} rowKey="id" rowClassName={(row, index) => (index === 0 ? 'first-row' : '')} />,
        );
        const firstRow = container.querySelectorAll('tbody tr')[0];
        expect(firstRow.classList.contains('first-row')).toBe(true);
    });
});

describe('StkTable React - Cell Events', () => {
    it('fires onCellClick', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const onCellClick = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" onCellClick={onCellClick} />);
        const cell = container.querySelectorAll('tbody td')[0];
        fireEvent.click(cell);
        expect(onCellClick).toHaveBeenCalled();
    });

    it('fires onCellMouseover', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const onCellMouseover = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" onCellMouseover={onCellMouseover} />);
        const cell = container.querySelectorAll('tbody td')[0];
        fireEvent.mouseOver(cell);
        expect(onCellMouseover).toHaveBeenCalled();
    });

    it('fires onRowDblclick', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const onRowDblclick = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" onRowDblclick={onRowDblclick} />);
        const row = container.querySelectorAll('tbody tr')[0];
        fireEvent.doubleClick(row);
        expect(onRowDblclick).toHaveBeenCalled();
    });

    it('fires onRowMenu (contextmenu)', () => {
        const columns = getColumns(2);
        const dataSource = getData(3);
        const onRowMenu = vi.fn();
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" onRowMenu={onRowMenu} />);
        const row = container.querySelectorAll('tbody tr')[0];
        fireEvent.contextMenu(row);
        expect(onRowMenu).toHaveBeenCalled();
    });
});

describe('StkTable React - Ref Methods', () => {
    it('exposes getTableData method', () => {
        const ref = createRef<StkTableRef<any>>();
        const columns = getColumns(2);
        const dataSource = getData(5);
        render(<StkTable ref={ref} columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(ref.current).not.toBeNull();
        const tableData = ref.current!.getTableData();
        expect(tableData.length).toBe(5);
    });

    it('exposes scrollTo method', () => {
        const ref = createRef<StkTableRef<any>>();
        const columns = getColumns(2);
        const dataSource = getData(5);
        render(<StkTable ref={ref} columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(() => ref.current!.scrollTo(0, 0)).not.toThrow();
    });

    it('exposes setSorter and resetSorter methods', () => {
        const ref = createRef<StkTableRef<any>>();
        const columns: StkTableColumn<any>[] = [{ title: 'Val', dataIndex: 'val', width: 100, sorter: true }];
        const dataSource = [
            { id: 0, val: 3 },
            { id: 1, val: 1 },
            { id: 2, val: 2 },
        ];
        render(<StkTable ref={ref} columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(() => ref.current!.setSorter('val', 'asc')).not.toThrow();
        expect(() => ref.current!.resetSorter()).not.toThrow();
    });

    it('exposes setCurrentRow method', () => {
        const ref = createRef<StkTableRef<any>>();
        const columns = getColumns(2);
        const dataSource = getData(5);
        const { container } = render(<StkTable ref={ref} columns={columns} dataSource={dataSource} rowKey="id" rowActive />);
        act(() => {
            ref.current!.setCurrentRow('0');
        });
        const activeRow = container.querySelector('tbody tr.active');
        expect(activeRow).toBeInTheDocument();
    });
});

describe('StkTable React - Column Align', () => {
    it('applies text alignment classes', () => {
        const columns: StkTableColumn<any>[] = [
            { title: 'Left', dataIndex: 'col0', width: 100, align: 'left' },
            { title: 'Center', dataIndex: 'col1', width: 100, align: 'center' },
            { title: 'Right', dataIndex: 'col2', width: 100, align: 'right' },
        ];
        const dataSource = getData(2);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const tds = container.querySelectorAll('tbody tr:first-child td');
        expect(tds[1].classList.contains('text-c')).toBe(true);
        expect(tds[2].classList.contains('text-r')).toBe(true);
    });
});

describe('StkTable React - Custom Bottom Slot', () => {
    it('renders custom bottom content', () => {
        const columns = getColumns(2);
        const { container } = render(
            <StkTable
                columns={columns}
                dataSource={getData(2)}
                rowKey="id"
                renderCustomBottom={() => <div className="custom-bottom">Bottom Content</div>}
            />,
        );
        expect(container.querySelector('.custom-bottom')?.textContent).toBe('Bottom Content');
    });
});

describe('StkTable React - Width/Style Props', () => {
    it('applies width style to table', () => {
        const columns = getColumns(2);
        const { container } = render(<StkTable columns={columns} dataSource={getData(2)} rowKey="id" width="800px" />);
        const table = container.querySelector('table');
        expect(table?.style.width).toBe('800px');
    });

    it('applies minWidth style to table', () => {
        const columns = getColumns(2);
        const { container } = render(<StkTable columns={columns} dataSource={getData(2)} rowKey="id" minWidth="600px" />);
        const table = container.querySelector('table');
        expect(table?.style.minWidth).toBe('600px');
    });
});

describe('StkTable React - Hidden Columns', () => {
    it('does not render hidden columns', () => {
        const columns: StkTableColumn<any>[] = [
            { title: 'Visible', dataIndex: 'col0', width: 100 },
            { title: 'Hidden', dataIndex: 'col1', width: 100, hidden: true },
        ];
        const dataSource = getData(2);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const ths = container.querySelectorAll('thead th');
        expect(ths.length).toBe(1);
        expect(ths[0].textContent).toContain('Visible');
    });
});
