import type { CustomCellProps } from '../../../../src/StkTable';
import type { DataType } from './types';

export default function YieldCell(props: CustomCellProps<DataType>) {
    const cellValue = props.cellValue as number;
    let className = '';
    if (cellValue > 0) {
        className = 'color-up';
    } else if (cellValue < 0) {
        className = 'color-down';
    }
    return (
        <span className={className}>
            {cellValue > 0 ? '+' : ''}
            {(cellValue * 100).toFixed(4)}%
        </span>
    );
}
