import { useEffect, useRef, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableRef } from '../../../src/StkTable';
import { columns, dataSource as dataSourceRaw } from './const';

export default function HighlightAnimation() {
    const stkTableRef = useRef<StkTableRef<any>>(null);
    const [dataSource, setDataSource] = useState<any[]>([...dataSourceRaw]);

    useEffect(() => {
        const interval1 = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimCell('id1', 'age', {
                keyframe: {
                    color: ['#fff', '#C70000', '#fff'],
                    transform: ['scale(1)', 'scale(1.1)', 'scale(1)'],
                    boxShadow: ['unset', '0 0 10px #aaa', 'unset'],
                    easing: 'cubic-bezier(.11,.1,.03,.98)',
                },
                duration: 1000,
            });
        }, 1790);
        return () => {
            window.clearInterval(interval1);
        };
    }, []);

    function addRowAnimation(id: string) {
        stkTableRef.current?.setHighlightDimRow([id], {
            keyframe: [
                {
                    backgroundColor: '#1e4c99',
                    transform: 'translateY(-30px) scale(0.6)',
                    opacity: 0,
                    easing: 'cubic-bezier(.11,.1,.03,.98)',
                },
                { backgroundColor: '#1B1B24', transform: 'translateY(0) scale(1)', opacity: 1 },
            ],
            duration: 1000,
        });
    }

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
            addRowAnimation(id);
        }, 0);
    }

    return (
        <div>
            <button className="btn" onClick={addData}>
                Add data
            </button>
            <StkTable ref={stkTableRef} style={{ height: '200px' }} rowKey="id" columns={columns} dataSource={dataSource} />
        </div>
    );
}
