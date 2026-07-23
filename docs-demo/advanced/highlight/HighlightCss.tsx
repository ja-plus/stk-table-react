import { useEffect, useRef } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableRef } from '../../../src/StkTable';
import { columns, dataSource } from './const';

export default function HighlightCss() {
    const stkTableRef = useRef<StkTableRef<any>>(null);

    useEffect(() => {
        const interval1 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['id0'], { method: 'css' });
        }, 1000);
        const interval2 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['id1'], {
                method: 'css',
                className: 'special-highlight-row',
                duration: 2000,
            });
        }, 1600);
        const interval3 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimCell('id2', 'name', {
                method: 'css',
                className: 'special-highlight-cell',
                duration: 1000,
            });
        }, 2300);
        const interval4 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimCell('id3', 'age', {
                method: 'css',
                className: 'special-highlight-cell-red',
                duration: 1500,
            });
        }, 2600);
        return () => {
            [interval1, interval2, interval3, interval4].forEach(n => window.clearInterval(n));
        };
    }, []);

    return (
        <div className="highlight-css-demo">
            <style>{`
                @keyframes my-highlight-row { from { background-color: #bd7201; } }
                @keyframes my-highlight-cell { from { background-color: #5fa95f; } }
                @keyframes my-highlight-cell-red { from { background-color: #b14949; } }
                .highlight-css-demo .special-highlight-row { animation: my-highlight-row 2s linear; }
                .highlight-css-demo .special-highlight-cell { animation: my-highlight-cell 1s linear; }
                .highlight-css-demo .special-highlight-cell-red { animation: my-highlight-cell-red 1.5s linear; }
            `}</style>
            <StkTable ref={stkTableRef} rowKey="id" columns={columns} dataSource={dataSource} />
        </div>
    );
}
