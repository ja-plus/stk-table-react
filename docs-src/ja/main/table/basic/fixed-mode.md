# table-layout: fixed

## 設定
`props.fixedMode` を有効にすると table-layout: fixed になります

## 例
1つの列を固定幅にし、残りの列を均等に分割するシナリオを実現するには、ネイティブtable-layout: fixedの均等列幅分散の動作を活用する必要があります。

::: warning 
このモードは `StkTableColumn['width']` にのみ影響します
:::

<demo react="basic/fixed-mode/FixedMode.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/fixed-mode/FixedMode.tsx"></demo>
