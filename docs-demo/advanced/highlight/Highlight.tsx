import { useEffect, useRef, useState } from 'react';
import RangeInput from '../../components/RangeInput';
import { StkTable } from '../../StkTable';
import type { StkTableRef, HighlightConfig } from '../../../src/StkTable';
import { columns, dataSource as dataSourceRaw } from './const';

export default function Highlight() {
    const stkTableRef = useRef<StkTableRef<any>>(null);
    const [dataSource, setDataSource] = useState<any[]>([...dataSourceRaw]);
    const [duration, setDuration] = useState(2);
    const [fps, setFps] = useState(0);

    const highlightConfig: HighlightConfig = {
        duration,
        fps,
    };

    useEffect(() => {
        const interval1 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimCell('id1', 'age');
        }, 2500);
        const interval2 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimCell('id2', 'gender');
        }, 1200);
        const interval3 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['id0']);
        }, 3000);
        return () => {
            window.clearInterval(interval1);
            window.clearInterval(interval2);
            window.clearInterval(interval3);
        };
    }, []);

    function addData() {
        const id = 'id' + dataSource.length;
        const newRow = {
            id,
            name: 'name' + dataSource.length,
            age: dataSource.length,
            gender: dataSource.length % 2 === 0 ? 'male' : 'female',
        };
        setDataSource([newRow, ...dataSource]);
        setTimeout(() => {
            stkTableRef.current?.setHighlightDimRow([id]);
        }, 0);
    }

    return (
        <div>
            <button className="btn" style={{ marginRight: '20px' }} onClick={addData}>
                Add data
            </button>
            <RangeInput value={duration} onChange={setDuration} min={0.1} max={5} step={0.1} label="Duration" suffix="s" />
            <RangeInput value={fps} onChange={setFps} min={0} max={30} label="FPS" suffix="fps" />
            <StkTable
                ref={stkTableRef}
                rowKey="id"
                style={{ height: '200px' }}
                highlightConfig={highlightConfig}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
    );
}
