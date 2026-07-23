# Start

## npm Installation

```sh
$ npm install stk-table-react
```

## Import

main
```ts
import 'stk-table-react/lib/style.css';
```

Import and use in your component.
```tsx
import { StkTable } from 'stk-table-react';

<StkTable />
```

## Simple Demo
```tsx
import { useEffect, useRef } from 'react';
import { StkTable } from 'stk-table-react';
import type { StkTableColumn, StkTableRef } from 'stk-table-react/src/StkTable/index';

type DataType = {
    id: string;
    name: string;
    age: number;
};
const columns: StkTableColumn<DataType>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: 'Zhang San', age: 18 },
    { id: 'k2', name: 'Li Si', age: 19 },
    { id: 'k3', name: 'Wang Wu', age: 20 },
];

export default () => {
    const stkTableRef = useRef<StkTableRef<DataType>>(null);
    useEffect(() => {
        // Highlight specified id row
        const interval = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['k1']);
        }, 2000);
        return () => window.clearInterval(interval);
    }, []);
    return <StkTable ref={stkTableRef} rowKey="id" columns={columns} dataSource={dataSource} />;
};
```

Running Result
<demo react="start/Start.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/start/Start.tsx"></demo>


