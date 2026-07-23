import { StkTable } from '../../StkTable';
import { getDataSource, columns } from './config';

const dataSource = getDataSource();

function handleToggleTreeExpand(data: { row: any; expanded: boolean }) {
    console.log('toggle tree expand', data);
}

export default function Tree() {
    return <StkTable style={{ maxHeight: '300px' }} columns={columns} dataSource={dataSource} onToggleTreeExpand={handleToggleTreeExpand} />;
}
