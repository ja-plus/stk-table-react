import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';

const columns: StkTableColumn<any>[] = [
    { title: 'Name', dataIndex: 'name', width: 100 },
    { title: 'Age', dataIndex: 'age' },
    { title: 'Gender', dataIndex: 'gender' },
    { title: 'Address', dataIndex: 'address', maxWidth: 200 },
];

const dataSource = [
    {
        name: `Jack`,
        age: 18,
        address: `Beijing Forbidden City, ${' Long text'.repeat(20)}`,
        gender: 'male',
    },
    { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
    { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
    { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
    ...new Array(5000).fill(0).map((_, i) => ({
        name: `Jack${i}`,
        age: 18,
        address: `Beijing Forbidden City `,
        gender: 'male',
    })),
];

export default function VirtualY() {
    return <StkTable style={{ height: '200px' }} virtual columns={columns} dataSource={dataSource} />;
}
