import { useEffect, useRef, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../src/StkTable/index';
import MatrixCell from './MatrixCell';
import type { CellDataType, RowDataType } from './type';
import { useI18n } from '../../hooks/useI18n/index';

const columns: StkTableColumn<RowDataType>[] = [
    { title: '', dataIndex: 'rowTitle', className: 'col-title', width: 100 } as any,
    { title: '1M', dataIndex: 'm1', className: 'no-padding', customCell: MatrixCell },
    { title: '3M', dataIndex: 'm3', className: 'no-padding', customCell: MatrixCell },
    { title: '6M', dataIndex: 'm6', className: 'no-padding', customCell: MatrixCell },
    { title: '1Y', dataIndex: 'y1', className: 'no-padding', customCell: MatrixCell },
];

const colTitle = ['AAA+', 'AAA', 'AA+', 'AA', '<=AA-'];

function createCellData(): CellDataType {
    return {
        code: Math.floor(Math.random() * 1000000) + '.IB',
        value: (Math.random() * 100).toFixed(4),
        count: Math.floor(Math.random() * 100),
        percent: Math.random() * 100,
        // 随机正负数
        bp: (Math.random() * 4 - 2).toFixed(2),
    };
}

function initTableData(): RowDataType[] {
    return colTitle.map(title => {
        const row: any = {
            rowTitle: title,
        };
        columns.forEach((col, colIndex) => {
            if (colIndex === 0) return;
            row[col.dataIndex] = createCellData();
        });
        return row as RowDataType;
    });
}

export default function MatrixDemo() {
    const { t } = useI18n();
    const stkTableRef = useRef<StkTableRef<RowDataType>>(null);

    const [tableData, setTableData] = useState<RowDataType[]>(() => initTableData());
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<number>(0);

    function updateCell() {
        setTableData(prev => {
            const next = [...prev];
            next[0] = { ...next[0], m1: createCellData() };
            return next;
        });
        stkTableRef.current?.setHighlightDimCell('AAA+', 'm1');
    }

    function updateLastColPercent() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = 0;
            setRunning(false);
            return;
        }

        intervalRef.current = self.setInterval(() => {
            setTableData(prev =>
                prev.map(row => {
                    let percent = row.y1.percent + 1;
                    if (percent > 100) {
                        percent = 0;
                    }
                    return { ...row, y1: { ...row.y1, percent } };
                }),
            );
        }, 100);
        setRunning(true);
    }

    useEffect(() => {
        updateLastColPercent();
        return () => {
            self.clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="matrix-demo">
            <button className="btn" onClick={updateCell}>
                {t('tryUpdate')}
            </button>
            <button className="btn" onClick={updateLastColPercent}>
                {running ? t('stop') : t('start')} {t('updateLastColumn')}
            </button>
            <StkTable
                ref={stkTableRef}
                rowKey="rowTitle"
                rowHeight={60}
                cellHover
                cellActive
                rowHover={false}
                rowActive={false}
                columns={columns}
                dataSource={tableData}
                onCellClick={e => console.log('cell-click', e)}
            />
            <style>{`
.matrix-demo .col-title {
    color: var(--th-color);
    background-color: var(--th-bgc);
    font-weight: bold;
    pointer-events: none;
}
.matrix-demo .stk-table .stk-table-main {
    height: 100%;
}
.matrix-demo .stk-table .no-padding {
    padding: 0;
}
.matrix-demo .matrix-cell {
    --percent: 50;
    --bg-color: #f0f0f0;
    height: calc(100% - 1px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 8px;
    cursor: default;
    background-image: linear-gradient(
        90deg,
        var(--bg-color-from),
        var(--bg-color-to) calc(var(--percent) * 1%),
        transparent calc(var(--percent) * 1%)
    );
}
.matrix-demo .matrix-cell.up {
    --font-color: #ff2b48;
    --bg-color-from: rgba(255, 43, 72, 0.15);
    --bg-color-to: rgba(255, 43, 72, 0.3);
}
.matrix-demo .matrix-cell.down {
    --font-color: #2fc87b;
    --bg-color-from: rgba(47, 200, 123, 0.15);
    --bg-color-to: rgba(47, 200, 123, 0.3);
}
.matrix-demo .matrix-cell.down .triangle {
    transform: rotate(180deg);
}
.matrix-demo .matrix-cell .row {
    display: flex;
    justify-content: space-between;
}
.matrix-demo .matrix-cell .code {
    font-size: 12px;
}
.matrix-demo .matrix-cell .bp {
    font-size: 12px;
    color: var(--font-color);
}
.matrix-demo .matrix-cell .value {
    font-size: 16px;
    font-weight: bold;
    color: var(--font-color);
}
.matrix-demo .matrix-cell .count {
    font-size: 12px;
}
.matrix-demo .matrix-cell .triangle {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 5px solid var(--font-color);
    margin-right: 4px;
}
`}</style>
        </div>
    );
}
