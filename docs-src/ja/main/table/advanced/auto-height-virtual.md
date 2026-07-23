# 可変行高仮想リスト

## 設定
| プロパティ  | 型  | デフォルト | 説明  |
| ----- | ----- | ----- | ----- |
| props.autoRowHeight | `boolean` \| `AutoRowHeightConfig<DT>` | false | 可変行高を有効にするかどうか |
| props.rowHeight | `number` | -- | `props.autoRowHeight` が `true` の場合、これは計算用の期待行の高さを表します。実際の行の高さには影響しません。 |

### AutoRowHeightConfig&lt;DT&gt;
```ts
type AutoRowHeightConfig<DT> = {
    /** 期待される行の高さ */
    expectedHeight?: number | ((row: DT) => number);
};
```

::: tip 期待される行の高さ
現在のテーブル高さに収まる行数を計算するために使用される行の推定高さ。
:::
::: tip 優先順位
`props.autoRowHeight.expectedHeight` > `props.rowHeight`
:::


## 例

<demo react="advanced/auto-height-virtual/AutoHeightVirtual/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/auto-height-virtual/AutoHeightVirtual/index.tsx"></demo>

セルの上下のパディングを制御したい場合は、CSS変数をオーバーライドすることで行うことができます：
```css
.stk-table {
    --cell-padding-y: 8px;
}
```

## 単位列リスト
[可変高さ - 仮想単位列リスト](/ja/demos/virtual-list.html#Variable%20Height) を参照してください。

## Pretextによる行高さの事前計算

行の高さがコンテンツから事前に計算可能な場合は、[@chenglou/pretext](https://github.com/chenglou/pretext)を使用して事前計算することを推奨します。これにより、ランタイムでの行高さ測定によるパフォーマンスオーバーヘッドを回避でき、スクロールバーのちらつきも防止できます。

### 仕組み

1. `auto-row-height` と `virtual` を有効にする
2. `prepare` と `layout` メソッドを使用してテキストの高さを計算
3. `setAutoHeight(rowKey, height)` で実際の行の高さを設定

### 例

<demo react="advanced/auto-height-virtual/PretextAutoHeight/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/auto-height-virtual/PretextAutoHeight/index.tsx"></demo>

### API

#### setAutoHeight(rowKey, height)

特定の行の行高さを手動で設定します。

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| rowKey | `string \| number` | 行の一意の識別子。`row-key`に対応 |
| height | `number` | 行の高さ |

::: tip ヒント
- データの読み込み完了後に呼び出す必要があります
- 行の高さが変更された場合は、このメソッドを再度呼び出して更新してください
- `null` または `undefined` を渡すと、設定された行の高さがクリアされ、自動測定に戻ります
:::
