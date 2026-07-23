# シーケンス列

`StkTableColumn['type']` を `seq` に設定して、コンポーネントの組み込みシーケンス列を使用します。

::: tip
シーケンス列は排序の影響を受けず、`props.data-source` の配列インデックスに基づいて表示されます。
:::

```ts
const columns: StkTableColumn<any>[] = [
    { type: 'seq', width: 50, dataIndex: '', title: 'No.' }, // [!code ++]
    { title: '名前', dataIndex: 'name', sorter: true },
    { title: '年齢', dataIndex: 'age', sorter: true },
    { title: '住所', dataIndex: 'address', sorter: true },
    { title: '性別', dataIndex: 'gender', sorter: true },
];
```

ここでは、`seq` 列の `dataIndex` が空であることがわかります。这是因为 `dataIndex` は値フィールドだけでなく、v-forレンダリングのキーとしても使用されるからです。シーケンス列にはキーが必要ないため、空のままにしています。**重複しないように注意してください**。

<demo react="basic/seq/Seq.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/seq/Seq.tsx"></demo>


## カスタムシーケンス
`props.seqConfig.startIndex` を設定して、シーケンスの開始値を指定できます。

これは特にページネーションに便利です。

<demo react="basic/seq/SeqStartIndex.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/seq/SeqStartIndex.tsx"></demo>
