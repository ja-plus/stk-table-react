import type { CSSProperties } from 'react';
import type { CustomCellProps } from '../../../src/StkTable/index';

export default function MatrixCell(props: CustomCellProps<any>) {
    const data = props.cellValue;
    return (
        <div
            className={'matrix-cell up' + (data.bp < 0 ? ' down' : '')}
            style={{ '--percent': data.percent } as CSSProperties}
        >
            <div className="row">
                <span className="code">{data.code}</span>
                <span className="bp">
                    <i className="triangle"></i>
                    {data.bp}
                </span>
            </div>
            <div className="row">
                <span className="value">{data.value}</span>
                <span className="count">{data.count}</span>
            </div>
        </div>
    );
}
