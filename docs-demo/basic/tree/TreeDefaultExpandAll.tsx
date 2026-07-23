import { StkTable } from '../../StkTable';
import { getDataSource, columns } from './config';

const dataSource = getDataSource();

export default function TreeDefaultExpandAll() {
    return (
        <StkTable
            style={{ maxHeight: '250px' }}
            treeConfig={{ defaultExpandAll: true }}
            scrollbar
            columns={columns}
            dataSource={dataSource}
        />
    );
}
