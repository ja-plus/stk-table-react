# 开始

## npm 安装

```sh
$ npm install stk-table-react
```

## 引入

main
```ts
import 'stk-table-react/lib/style.css';
```

在组件中引入使用。
```tsx
import { StkTable } from 'stk-table-react';

<StkTable />
```

## 简单demo
```tsx
import { useEffect, useRef } from 'react';
import { StkTable } from 'stk-table-react';
import type { StkTableColumn, StkTableRef } from 'stk-table-react/src/StkTable/index';

type DataType = {
    id: string;
    name: string;
    age: number;
    address: string;
};
const columns: StkTableColumn<DataType>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age', align: 'right' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: 'Tom', age: 18, address: 'Beijing' },
    { id: 'k2', name: 'Jerry', age: 19, address: 'Shanghai' },
    { id: 'k3', name: 'Jack', age: 20, address: 'London' },
    { id: 'k4', name: 'Rose', age: 22, address: 'New York' },
];

export default () => {
    const stkTableRef = useRef<StkTableRef<DataType>>(null);
    useEffect(() => {
        const interval = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['k1']);
        }, 2000);
        return () => window.clearInterval(interval);
    }, []);
    return <StkTable ref={stkTableRef} rowKey="id" columns={columns} dataSource={dataSource} />;
};
```

运行结果
<demo react="start/Start.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/start/Start.tsx"></demo>


