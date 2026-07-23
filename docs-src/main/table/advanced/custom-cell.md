# 自定义单元格

* 通过 `StkTableColumn['customCell']` 自定义**表体**单元格内容。
* 通过 `StkTableColumn['customHeaderCell']` 自定义**表头**单元格内容。

`customCell` 和 `customHeaderCell` 使用方式基本相同，下面以 `customCell` 为例子进行说明。

::: warning 建议
* `customCell` 建议套上一层元素(div,span等)，否则 &lt;td&gt; 子节点为 `TextNode` 可能导致布局问题。
* `customCell` 的根元素请**谨慎**设置 `inline`/`inline-block`/`inline-flex` 等行内元素，此布局在**虚拟列表**中可能会撑开行高。
:::

### 通过React组件使用
支持传入React组件，组件的 props 需要用 `CustomCellProps` 类型特殊定义。

::: tip 最佳实践
 columns 单独写在一个文件中导出使用。
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell';
export const columns: StkTableColumn<DataType> = [{
    title: '收益率',
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

### 通过JSX使用
`customCell` 也可以直接返回 JSX，适合简单的修改。

比如我们对数值**乘以100**再加**单位**。
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: '收益率',
        dataIndex: 'yield',
        customCell: ({ cellValue }) => <span>{cellValue * 100}%</span>,
    },
]
```

还可以根据单元格的值设置样式：
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: '姓名',
        dataIndex: 'name',
        customCell: ({ row, col, cellValue }) => {
            return <span style={{ color: 'red' }}>{cellValue}</span>;
        },
    },
]
```



## API
| 属性 | props | 默认值 | 说明 |
|---|---|---|---|
| customCell | ComponentType&lt;CustomCellProps&gt; | - | 自定义单元格渲染组件 |
| customHeaderCell | ComponentType&lt;CustomHeaderCellProps&gt; | - | 自定义表头渲染组件 |

### types
customCell props 类型
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex] 的值 */
    cellValue: any;
    rowIndex: number;
    /** 
     * 列索引(从0开始)。
     * 
     * 注意：
     * 在virtual-x 下，否则表示虚拟列表中的列索引
     */
    colIndex: number;
    /**
     * 当前行是否展开
     * - 不展开: null
     * - 展开: 返回column配置
     */
    expanded?: StkTableColumn<any>;
    /** 树节点当前行是否展开 */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * 列索引(从0开始)。
     * 
     * 注意：
     * 在virtual-x 下，否则表示虚拟列表中的列索引
     */
    colIndex: number;
};



```
