import { createContext, useContext, useState } from 'react';
import type { DragEvent } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, CustomCellProps } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';

type Row = { id: number; name: string; email: string; phone: string };

const DragCtx = createContext<{ reorder: (src: number, end: number) => void } | null>(null);

function addHoverStyle(target: HTMLElement) {
    const tr = target.closest('tr');
    if (tr) {
        tr.style.boxShadow = 'inset 0 -2px 0 0 #1d63d9';
    }
}
function removeHoverStyle(target: HTMLElement) {
    const tr = target.closest('tr');
    if (tr) {
        tr.style.removeProperty('box-shadow');
    }
}

function handleDragStart(e: DragEvent, startIndex: number) {
    const target = e.target as HTMLElement;
    const tr = target.closest('tr');
    if (tr) {
        e.dataTransfer?.setDragImage(tr, 50, 10);
        tr.style.opacity = '0.5';
    }
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('sourceIndex', String(startIndex)); // 保存拖动开始的位置
    }
}

function handleDragEnd(e: DragEvent) {
    const target = e.target as HTMLElement;
    const tr = target.closest('tr');
    if (tr) {
        tr.style.opacity = '1';
    }
}
function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
}
function handleDragEnter(e: DragEvent) {
    addHoverStyle(e.target as HTMLElement);
}

function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.classList.contains('custom-drag-handle')) {
        removeHoverStyle(target);
    }
}

function CustomDragHandle(props: CustomCellProps<any>) {
    const rowIndex = props.rowIndex as number;
    const { reorder } = useContext(DragCtx)!;

    const handleDrop = (e: DragEvent) => {
        removeHoverStyle(e.target as HTMLElement);
        const sourceIndex = Number(e.dataTransfer?.getData('sourceIndex'));
        if (isNaN(sourceIndex) || sourceIndex === rowIndex) return;
        reorder(sourceIndex, rowIndex);
    };

    return (
        <div
            draggable
            className="custom-drag-handle"
            onDragStart={e => handleDragStart(e, rowIndex)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
        >
            <div className="point-wrapper">
                <div className="point" />
                <div className="point" />
                <div className="point" />
                <div className="point" />
            </div>
        </div>
    );
}

const columns: StkTableColumn<any>[] = [
    { dataIndex: 'id', title: 'id' },
    {
        dataIndex: '',
        width: 200,
        title: 'Custom',
        align: 'center',
        customCell: CustomDragHandle,
    },
    { dataIndex: 'email', title: 'email' },
    { dataIndex: 'phone', title: 'phone' },
];

export default function RowDragCustom() {
    const [virtual, setVirtual] = useState(false);
    const [data, setData] = useState<Row[]>(() =>
        new Array(100).fill(0).map((_, index) => {
            return {
                id: index,
                name: 'name' + index,
                email: 'email' + index + '@example.com',
                phone: '123-456-7890',
            };
        }),
    );

    const reorder = (src: number, end: number) => {
        setData(prev => {
            const d = prev.slice();
            const sourceData = d[src];
            d.splice(src, 1);
            d.splice(end, 0, sourceData);
            return d;
        });
    };

    return (
        <div className="row-drag-custom">
            <style>{`
                .row-drag-custom .custom-drag-handle { padding: 2px; cursor: grab; border-radius: 4px; display: flex; justify-content: center; }
                .row-drag-custom .custom-drag-handle:hover { background-color: var(--vp-c-border); }
                .row-drag-custom .custom-drag-handle .point-wrapper { height: 14px; width: 16px; position: relative; pointer-events: none; }
                .row-drag-custom .custom-drag-handle .point { width: 4px; height: 4px; border-radius: 50%; background-color: #888; position: absolute; }
                .row-drag-custom .custom-drag-handle .point:nth-child(2) { left: 8px; }
                .row-drag-custom .custom-drag-handle .point:nth-child(3) { top: 8px; }
                .row-drag-custom .custom-drag-handle .point:nth-child(4) { left: 8px; top: 8px; }
            `}</style>
            <CheckItem checked={virtual} onChange={setVirtual} text="virtual" />
            <DragCtx.Provider value={{ reorder }}>
                <StkTable columns={columns} style={{ height: '300px' }} rowKey="id" virtual={virtual} dataSource={data} />
            </DragCtx.Provider>
        </div>
    );
}
