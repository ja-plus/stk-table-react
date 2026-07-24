<p align="center">
    <a href="https://ja-plus.github.io/stk-table-react/">
        <img src="./docs-src/public/assets/logo.svg" width="152">
    </a>
    <h3 align='center'>Stk Table React</h3>
    <p align="center">
        <a href="https://www.npmjs.com/package/stk-table-react"><img src="https://img.shields.io/npm/v/stk-table-react"></a>
        <a href="https://www.npmjs.com/package/stk-table-react"><img src="https://img.shields.io/npm/dw/stk-table-react"></a>
        <a href="https://github.com/ja-plus/stk-table-react/stargazers"><img src="https://img.shields.io/github/stars/ja-plus/stk-table-react.svg"></a>
        <a href="https://raw.githubusercontent.com/ja-plus/stk-table-react/master/LICENSE"><img src="https://img.shields.io/npm/l/stk-table-react"></a>
        <a href="https://github.com/ja-plus/stk-table-react"><img src="https://img.shields.io/npm/types/stk-table-react"></a>
    </p>
</p>

High performance realtime virtual table for React.

Rewrote [stk-table-vue](https://github.com/ja-plus/stk-table-vue) using React

## Documentation
### [Stk Table React Official](https://ja-plus.github.io/stk-table-react/)
### [Stk Table Vue Official](https://ja-plus.github.io/stk-table-vue/)

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
