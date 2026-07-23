import { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import from the BUILT lib output to verify the published artifact works.
// @ts-ignore - lib is a build artifact without bundled types in this path
import * as Lib from '../lib/stk-table-react.js';

const { StkTable, createCheckboxCell, createEditableCell, createFilterCell, tableSort, binarySearch, insertToOrderedArray, strCompare } = Lib as any;

// Mock requestAnimationFrame (StkTable uses it for virtual scroll init)
beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        cb(0);
        return 0;
    });
});

function getColumns(count = 3): any[] {
    return Array.from({ length: count }, (_, i) => ({
        title: `Col${i}`,
        dataIndex: `col${i}`,
        width: 100,
    }));
}

function getData(count = 5): any[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        col0: `val-${i}-0`,
        col1: `val-${i}-1`,
        col2: `val-${i}-2`,
    }));
}

describe('Built lib artifact (lib/stk-table-react.js)', () => {
    it('exposes the public API', () => {
        expect(StkTable).toBeDefined();
        expect(typeof StkTable).toBe('object'); // forwardRef exotic component
        expect(typeof createCheckboxCell).toBe('function');
        expect(typeof createEditableCell).toBe('function');
        expect(typeof createFilterCell).toBe('function');
        expect(typeof tableSort).toBe('function');
        expect(typeof binarySearch).toBe('function');
        expect(typeof insertToOrderedArray).toBe('function');
        expect(typeof strCompare).toBe('function');
        expect(Lib.StkTableContext).toBeDefined();
    });

    it('renders a table from the built lib', () => {
        const columns = getColumns();
        const dataSource = getData(5);
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(container.querySelector('.stk-table')).toBeInTheDocument();
        expect(container.querySelectorAll('thead th').length).toBe(3);
        expect(container.querySelectorAll('tbody tr').length).toBe(5);
    });

    it('renders cell values from the built lib', () => {
        const columns = getColumns(2);
        const dataSource = [{ id: 0, col0: 'hello-lib', col1: 'world-lib' }];
        const { container } = render(<StkTable columns={columns} dataSource={dataSource} rowKey="id" />);
        const text = container.querySelector('tbody')?.textContent || '';
        expect(text).toContain('hello-lib');
        expect(text).toContain('world-lib');
    });

    it('exposes ref methods from the built lib', () => {
        const ref = createRef<any>();
        const columns = getColumns(2);
        const dataSource = getData(3);
        render(<StkTable ref={ref} columns={columns} dataSource={dataSource} rowKey="id" />);
        expect(ref.current).toBeDefined();
        expect(typeof ref.current.initVirtualScroll).toBe('function');
        expect(typeof ref.current.setSorter).toBe('function');
        expect(typeof ref.current.sortStates).toBe('function');
    });

    it('tableSort from lib sorts data', () => {
        const col: any = { dataIndex: 'n', title: 'n' };
        const data = [{ n: 3 }, { n: 1 }, { n: 2 }];
        const sorted = tableSort(col, 'asc', data, {});
        expect(sorted.map((d: any) => d.n)).toEqual([1, 2, 3]);
    });
});
