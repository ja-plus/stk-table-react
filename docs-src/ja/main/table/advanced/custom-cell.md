# カスタムセル

* `StkTableColumn['customCell']` で**ボディ**セルの内容をカスタマイズします。
* `StkTableColumn['customHeaderCell']` で**ヘッダー**セルの内容をカスタマイズします。

`customCell` と `customHeaderCell` の使い方は基本的に同じです。ここでは `customCell` を例に説明します。

::: warning 推奨事項
* `customCell` は要素（div、span など）でラップすることを推奨します。そうでないと、&lt;td&gt; の子ノードが `TextNode` となり、レイアウトの問題が発生する可能性があります。
* `customCell` のルート要素に `inline`/`inline-block`/`inline-flex` などのインライン要素を設定する場合は**慎重に**行ってください。このレイアウトは**仮想リスト**で行の高さを引き伸ばす可能性があります。
:::

### Reactコンポーネントで使用
Reactコンポーネントを渡すことができます。コンポーネントの props は `CustomCellProps` 型で特別に定義する必要があります。

::: tip ベストプラクティス
 columns は単一のファイルに記述してエクスポートしてください。
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell';
export const columns: StkTableColumn<DataType> = [{
    title: '利回り',
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

### JSXで使用
`customCell` は JSX を直接返すこともでき、簡単な変更に便利です。

たとえば、数値に**100を掛けて****単位**を追加します。
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: '利回り',
        dataIndex: 'yield',
        customCell: ({ cellValue }) => <span>{cellValue * 100}%</span>,
    },
]
```

セルの値に基づいてスタイルを設定することもできます：
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: '名前',
        dataIndex: 'name',
        customCell: ({ row, col, cellValue }) => {
            return <span style={{ color: 'red' }}>{cellValue}</span>;
        },
    },
]
```



## API
| プロパティ | props | デフォルト | 説明 |
|---|---|---|---|
| customCell | ComponentType&lt;CustomCellProps&gt; | - | カスタムセル描画コンポーネント |
| customHeaderCell | ComponentType&lt;CustomHeaderCellProps&gt; | - | カスタムヘッダーセル描画コンポーネント |

### types
customCell props の型
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex] の値 */
    cellValue: any;
    rowIndex: number;
    /** 
     * 列インデックス（0から始まる）
     * 
     * 注意：
     * virtual-x では、仮想リスト内の列インデックスを表します
     */
    colIndex: number;
    /**
     * 現在の行が展開されているか
     * - 未展開: null
     * - 展開: column設定を返す
     */
    expanded?: StkTableColumn<any>;
    /** ツリーノードの現在の行が展開されているか */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * 列インデックス（0から始まる）
     * 
     * 注意：
     * virtual-x では、仮想リスト内の列インデックスを表します
     */
    colIndex: number;
};



```
