import { StkTable } from '../../StkTable';
import { getDataSource, columns } from './config';

const dataSource = getDataSource();

export default function TreeDefaultExpandLevel() {
    return <StkTable style={{ maxHeight: '250px' }} treeConfig={{ defaultExpandLevel: 1 }} columns={columns} dataSource={dataSource} />;
}
