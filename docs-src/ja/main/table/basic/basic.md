# 基本

* `props.columns` で列を設定します。
* `props.dataSource` でデータソースを設定します。
* `props.rowKey` で一意の行識別子を設定します。
* css スタイルでテーブル高さを設定します。

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
    { title: '名前', dataIndex: 'name' },
    { title: '年齢', dataIndex: 'age', headerAlign: 'right', align: 'right' },
    { title: '性別', dataIndex: 'gender', align: 'center' },
    { title: '住所', dataIndex: 'address' },
];

export default () => {
    const [dataSource] = useState<Data[]>([
        { name: `田中`, age: 18, address: `東京都渋谷区`, gender: 'male' },
        { name: `佐藤`, age: 20, address: `大阪府大阪市`, gender: 'male' },
        { name: `高橋`, age: 22, address: `愛知県名古屋市`, gender: 'female' },
        { name: `伊藤`, age: 24, address: `福岡県福岡市`, gender: 'female' },
    ]);
    return <StkTable style={{ height: 200 }} rowKey="name" columns={columns} dataSource={dataSource} />;
};
```

<demo react="basic/Basic.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/Basic.tsx"></demo>
