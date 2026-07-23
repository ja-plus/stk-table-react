# Custom Cell

* Customize **body** cell content via `StkTableColumn['customCell']`.
* Customize **header** cell content via `StkTableColumn['customHeaderCell']`.

`customCell` and `customHeaderCell` are used similarly. Here we'll use `customCell` as an example.

::: warning Recommendations
* It's recommended to wrap `customCell` with an element (div, span, etc.), otherwise having `TextNode` as the child of &lt;td&gt; may cause layout issues.
* Be **cautious** when setting root elements of `customCell` as inline elements (inline, inline-block, inline-flex, etc.), as this layout may stretch row heights in **virtual lists**.
:::

### Using with a React Component
Supports passing React components. The props of the component need to be specially defined with the `CustomCellProps` type.

::: tip Best Practice
Define columns in a separate file and export them.
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell';
export const columns: StkTableColumn<DataType> = [{
    title: 'Yield Rate',
    dataIndex: 'yield',
    customCell: YieldCell
}]
```
```tsx [YieldCell.tsx]
import type { CustomCellProps } from 'stk-table-react/src/StkTable/index';
import type { DataType } from './types';

export default function YieldCell(props: CustomCellProps<DataType>) {
    let className = '';
    if (props.cellValue > 0) {
        className = 'color-up';
    } else if (props.cellValue < 0) {
        className = 'color-down';
    }
    return (
        <span className={className}>
            {props.cellValue > 0 ? '+' : ''}
            {(props.cellValue * 100).toFixed(4)}%
        </span>
    );
}
```
```ts [types.ts]
export type DataType = {
    name: string;
    yield: number;
};

```
```css [style.css]
.color-up {
    color: #2fc87b;
}
.color-down {
    color: #ff2b48;
}
```
:::

<demo react="advanced/custom-cell/CustomCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cell/CustomCell/index.tsx"></demo>

### Using with JSX
`customCell` can also return JSX directly, which is convenient for simple modifications.

For example, we can **multiply the value by 100** and add a **unit**.
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: 'Yield Rate',
        dataIndex: 'yield',
        customCell: ({ cellValue }) => <span>{cellValue * 100}%</span>,
    },
]
```

You can also style based on the cell value:
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: 'Name',
        dataIndex: 'name',
        customCell: ({ row, col, cellValue }) => {
            return <span style={{ color: 'red' }}>{cellValue}</span>;
        },
    },
]
```



## API
| Property | props | Default | Description |
|---|---|---|---|
| customCell | ComponentType&lt;CustomCellProps&gt; | - | Custom cell rendering component |
| customHeaderCell | ComponentType&lt;CustomHeaderCellProps&gt; | - | Custom header cell rendering component |

### types
customCell props type
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** Value of row[col.dataIndex] */
    cellValue: any;
    rowIndex: number;
    /** 
     * Column index (starting from 0)
     * 
     * Note:
     * - In virtual-x, otherwise it represents the index in the virtual list
     */
    colIndex: number;
    /**
     * Whether the current row is expanded
     * - Not expanded: null
     * - Expanded: returns column configuration
     */
    expanded?: StkTableColumn<any>;
    /** Whether the current tree node row is expanded */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * Column index (starting from 0)
     * 
     * Note:
     * - In virtual-x, otherwise it represents the index in the virtual list
     */
    colIndex: number;
};



```
