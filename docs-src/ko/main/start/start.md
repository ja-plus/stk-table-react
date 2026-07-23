# 빠른 시작

## npm 설치

```sh
$ npm install stk-table-react
```

## 가져오기

main
```ts
import 'stk-table-react/lib/style.css';
```

컴포넌트에서 가져와서 사용합니다.
```tsx
import { StkTable } from 'stk-table-react';

<StkTable />
```

## 간단한 데모
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
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '나이', dataIndex: 'age', key: 'age' },
];
const dataSource: DataType[] = [
    { id: 'k1', name: '김철수', age: 18 },
    { id: 'k2', name: '이영희', age: 19 },
    { id: 'k3', name: '박민수', age: 20 },
];

export default () => {
    const stkTableRef = useRef<StkTableRef<DataType>>(null);
    useEffect(() => {
        // 지정한 id의 행 강조
        const interval = window.setInterval(() => {
            stkTableRef.current?.setHighlightDimRow(['k1']);
        }, 2000);
        return () => window.clearInterval(interval);
    }, []);
    return <StkTable ref={stkTableRef} rowKey="id" columns={columns} dataSource={dataSource} />;
};
```

실행 결과
<demo react="start/Start.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/start/Start.tsx"></demo>
