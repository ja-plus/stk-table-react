import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';

const columns: StkTableColumn<any>[] = [
    { title: 'Name', dataIndex: 'name', width: 100 },
    { title: 'Age', dataIndex: 'age' },
    { title: 'Gender', dataIndex: 'gender' },
    { title: 'Address', dataIndex: 'address', maxWidth: 200 },
    // 5000 columns
    ...new Array(5000).fill(0).map((_, i) => ({ title: `Column ${i}`, dataIndex: `column-${i}` })),
];

const dataSource = [
    {
        name: `Jack`,
        age: 18,
        address: `Beijing`,
        gender: 'male',
    },
    { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
    { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
    { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
];

export default function VirtualX() {
    return <StkTable virtualX columns={columns} dataSource={dataSource} />;
}
