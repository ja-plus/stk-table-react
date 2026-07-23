import type { CustomCellProps } from '../../../../src/StkTable/index';
import type { DataType } from '../types';

const sourceNameMap: any = {
    1: 'Aa',
    2: 'Bb',
    3: 'Cc',
    4: 'Dd',
    5: 'Ee',
    6: 'Ff',
};

export default function SourceCell(props: CustomCellProps<DataType>) {
    return (
        <div>
            <div className={'source-cell source-' + props.cellValue}>{sourceNameMap[props.cellValue]}</div>
        </div>
    );
}
