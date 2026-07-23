# テーブルサイズ

テーブルの幅と高さは、ルートのコンテナの幅と高さによって決まります。

したがって、テーブルを `flex` コンテナに配置し、`flex` に高さ的管理させることで、手動で幅と高さを設定する必要がなくなります。

## 固定幅と高さ

::: tip
`style` を通じてテーブルの幅と高さを制御します。
:::     

<demo react="basic/size/Default.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/size/Default.tsx"></demo>

## Flex レイアウト

::: tip
外側の `flex` コンテナの高さを制御すると、テーブル高さが自适应します。
:::

<demo react="basic/size/Flex.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/size/Flex.tsx"></demo>
