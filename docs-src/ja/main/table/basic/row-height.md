# 行の高さ

* `props.rowHeight` でボディの行の高さを設定します、デフォルトは `28px`。
* `props.headerRowHeight` でヘッダーの行の高さを設定します、デフォルトは `28px`。
* `props.footerRowHeight` でフッターの行の高さを設定します、デフォルトは `28px`。

## 例
以下では、ヘッダーの行の高さを `50px`、ボディの行の高さを `40px` に設定します。
```tsx
<StkTable rowHeight={40} headerRowHeight={50} />
```
::: info
**通常**（非仮想リスト）モードでは、コンテンツが行の高さを超えると、行の高さが拡張されます。

**仮想リスト**モードでは、行の高さは常に設定値になります。
:::

<demo react="basic/row-height/RowHeight.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/row-height/RowHeight.tsx"></demo>

仮想リストが有効な場合、スクロールにより列幅が変化する場合がありますが、これは列幅が設定されていないためです。


## フレキシブル行高さ
まず、`<StkTable>` コンポーネントの高さが十分である必要があります。`flex` や `grid` などの柔軟なレイアウトに配置するか、高さを `100%` に設定して、親要素がその高さを決めるようにします（子要素によって拡張されません）。

次に、`.stk-table .stk-table-scroll-container` の `flex` を `1` に設定します。

以下のようになります

```css
:deep(.stk-table .stk-table-scroll-container) {
    flex: 1;
}
```

以下の高さコントローラーをドラッグして、フレキシブル行高さを確認してください。
<demo react="basic/row-height/RowHeightFull.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/row-height/RowHeightFull.tsx"></demo>
これは **行数が固定** のテーブルに便利です。

::: info
高さを一定まで減らすと、最小の高さはまだテーブル内のコンテンツによって決められていることがわかります（min-content）。
:::
