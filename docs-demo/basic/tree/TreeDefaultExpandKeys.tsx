import { StkTable } from '../../StkTable';
import { getDataSource, columns } from './config';

const dataSource = getDataSource();

export default function TreeDefaultExpandKeys() {
    return (
        <StkTable
            style={{ maxHeight: '250px' }}
            rowKey="area"
            treeConfig={{ defaultExpandKeys: ['Asia', 'China', 'Zhejiang'] }}
            columns={columns}
            dataSource={dataSource}
        />
    );
}
