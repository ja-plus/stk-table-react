# 테두리

`bordered` 속성을 사용하여 테이블 테두리를 설정할 수 있습니다.

```tsx
import { useState } from 'react';
import { StkTable } from 'stk-table-react';
import type { StkTableColumn } from 'stk-table-react/src/StkTable/index';

type Data = {
    name: string;
    age: number;
};

const columns: StkTableColumn<Data>[] = [
    { type: 'seq', title: 'No.', dataIndex: '' as any, width: 50 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age' },
];

export default () => {
    const [dataSource] = useState<Data[]>([
        { name: 'Jack', age: 18 },
        { name: 'Tom', age: 20 },
        { name: 'Lucy', age: 22 },
    ]);
    return <StkTable bordered style={{ height: 200 }} rowKey="name" columns={columns} dataSource={dataSource} />;
};
```
