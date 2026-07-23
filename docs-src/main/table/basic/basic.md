# 基础

* `props.columns` 配置列.
* `props.dataSource` 配置数据源。
* `props.rowKey` 配置行唯一标识。
* css style 配置表格高度。

```tsx
import { useState } from 'react';
import { StkTable } from 'stk-table-react';
import type { StkTableColumn } from 'stk-table-react/src/StkTable/index';

type Data = {
    name: string;
    age: number;
    address: string;
    gender: 'male' | 'female';
};

const columns: StkTableColumn<Data>[] = [
    { type: 'seq', title: 'No.', dataIndex: '' as any, width: 50 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age', headerAlign: 'right', align: 'right' },
    { title: 'Gender', dataIndex: 'gender', align: 'center' },
    { title: 'Address', dataIndex: 'address' },
];

export default () => {
    const [dataSource] = useState<Data[]>([
        { name: `Jack`, age: 18, address: `Beijing Forbidden City `, gender: 'male' },
        { name: `Tom`, age: 20, address: `Shanghai`, gender: 'male' },
        { name: `Lucy`, age: 22, address: `Guangzhou`, gender: 'female' },
        { name: `Lily`, age: 24, address: `Shenzhen`, gender: 'female' },
    ]);
    return <StkTable style={{ height: 200 }} rowKey="name" columns={columns} dataSource={dataSource} />;
};
```

<demo react="basic/Basic.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/Basic.tsx"></demo>