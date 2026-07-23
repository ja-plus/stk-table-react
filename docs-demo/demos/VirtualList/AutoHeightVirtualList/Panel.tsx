import type { CustomCellProps } from '../../../../src/StkTable/index';
import type { DataType } from './types';

export default function Panel(props: CustomCellProps<DataType>) {
    const row = props.row;
    return (
        <div className="panel">
            <header>{row.id + 1}.{row.title}</header>
            <article>{row.content}</article>
            <footer>{row.date}</footer>
        </div>
    );
}
