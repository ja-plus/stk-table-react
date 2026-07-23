# 行ドラッグ並べ替え

テーブル内の行をドラッグして順序を変更します。

## 例
`StkTableColumn['type']="dragRow"` で組み込みドラッグを使用

::: warning
`dragRow` の列設定では `dataIndex` が指定されていません。これは、一意キーが `props.colKey` でオーバーライドされ、`StkTableColumn['key']` フィールドが優先されるからです。
:::

<demo react="advanced/row-drag/RowDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDrag.tsx"></demo>

ネイティブ draggable API を使用して自分で実装することもできます。参照してください：

<demo react="advanced/row-drag/RowDragCustom.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDragCustom.tsx"></demo>

## API

### props
```ts
/**
 * 行ドラッグイベント
 *
 * ```(dragStartKey: string, targetRowKey: string)```
 */
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```
