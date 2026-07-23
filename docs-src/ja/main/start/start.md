# クイックスタート

## npm インストール

```sh
$ npm install stk-table-react
```

## インポート

main
```ts
import 'stk-table-react/lib/style.css';
```

コンポーネントでインポートして使用します。
```tsx
import { StkTable } from 'stk-table-react';

<StkTable />
```

## シンプルなデモ
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
    { title: '名前', dataIndex: 'name', key: 'name' },
    { title: '年齢', dataIndex: 'age', key: 'age' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: '田中', age: 18 },
    { id: 'k2', name: '佐藤', age: 19 },
    { id: 'k3', name: '鈴木', age: 20 },
];

export default () => {
    const stkTableRef = useRef<StkTableRef<DataType>>(null);
    useEffect(() => {
        // 指定したidの行をハイライト
        const interval = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['k1']);
        }, 2000);
        return () => window.clearInterval(interval);
    }, []);
    return <StkTable ref={stkTableRef} rowKey="id" columns={columns} dataSource={dataSource} />;
};
```

実行結果
<demo react="start/Start.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/start/Start.tsx"></demo>
