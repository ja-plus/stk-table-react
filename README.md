# stk-table-react

High performance realtime virtual table for React.

## Features

- Virtual scrolling (vertical / horizontal / variable row height)
- Fixed columns & fixed header (based on `position: sticky`)
- Sort, multi-sort, custom sort
- Tree data, expand row
- Multi-level header
- Cell merging
- Highlight rows / cells
- Column resize, column drag reorder, row drag reorder
- Area selection
- Custom cells
- Full TypeScript types

## Install

```bash
pnpm add stk-table-react
```

## Usage

```tsx
import { StkTable } from 'stk-table-react';
import type { StkTableColumn } from 'stk-table-react';
import 'stk-table-react/lib/style.css';

type Data = {
    name: string;
    age: number;
    address: string;
};

const columns: StkTableColumn<Data>[] = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age' },
    { title: 'Address', dataIndex: 'address' },
];

const dataSource: Data[] = [
    { name: 'Jack', age: 18, address: 'Beijing' },
    { name: 'Tom', age: 20, address: 'Shanghai' },
];

function App() {
    return <StkTable style={{ height: 200 }} rowKey="name" columns={columns} dataSource={dataSource} />;
}
```

## Development

```bash
pnpm install
pnpm dev          # start dev playground
pnpm test         # run vitest
pnpm build        # build library to lib/
pnpm docs:dev     # start vitepress docs
```

## License

MIT
