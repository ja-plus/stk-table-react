# 列幅変更

## 設定
* `props.colResizable` で列幅調整を有効にします。
* `props.columns` は `onUpdateColumns` コールバックで更新する必要があります。列幅を調整した後、`StkTableColumn['width']` の値が直接変更されます。
* `columns` はリアクティブな更新をサポートするために `useState` で保持する必要があります。

```js
<StkTable
    colResizable // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

::: warning
列幅調整を有効にすると、列はデフォルトでコンテナを埋めることはありません。テーブルの `width` は `fit-content` に設定されます。問題がある場合は、`props.width` が渡されているかどうかを確認してください。
:::

<demo react="advanced/column-resize/ColResizable.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/column-resize/ColResizable.tsx"></demo>


## イベントで列幅を変更
```ts
/**
 * 列幅が変更されたときにトリガーされます
 *
 *  ```(col: StkTableColumn<DT>)```
 */
onColResize?: (col: StkTableColumn<DT>) => void;
```

この方法では、`onUpdateColumns` コールバックで更新する必要はありません。`StkTableColumn['width']` の値を手動で更新できます。

## 列をコンテナに埋めるハック
列をコンテナに埋めたい場合は、`.stk-table-main` を手動で `flex: 1` に設定できるため、テーブルはコンテナを埋めます。

次に、列の `width` を `minWidth` に置き換えると、この列は残りの幅を自動的に占有し、他の列は設定された幅のままになります。

`props.colResizable.disabled` を介して最後の列の列幅調整を無効にします。

以下のデモでは、最後の列に minWidth を設定しています。
<demo react="advanced/column-resize/ColResizableFullHack.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/column-resize/ColResizableFullHack.tsx"></demo>


## API
### props.colResizable:
| 型 | 説明 |
| --- | --- | 
| boolean | 列幅調整を有効にするかどうか |
| ColResizableConfig | 設定 |

### ColResizableConfig
| プロパティ | 型 | デフォルト | 説明 |
| --- | --- | ---- | --- |
| disabled | `(col:StkTableColumn) => boolean` | -- | 特定の列の列幅調整を有効にするかどうか |
