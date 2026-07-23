# マルチレベルヘッダー
## 設定
`StkTableColumn['children']` でマルチレベルヘッダーを設定します
```ts 
const columns: StkTableColumn<any>[] = [
    {
        dataIndex: '基本',
        title: '基本',
        children: [ // [!code highlight]
            { dataIndex: 'id',title: 'ID', width: 100,},
            {
                dataIndex: 'lv2',
                title: 'Lv 2',
                width: 100,
                children: [ // [!code highlight]
                    { dataIndex: 'lv2_1', title: 'Lv 2.1', width: 100,}, 
                    { dataIndex: 'lv2_2', title: 'Lv 2.2', width: 100,},
                ],
            },
        ],
    },
]
```


<demo react="basic/multi-header/MultiHeader.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/multi-header/MultiHeader.tsx"></demo>

## 横方向仮想リスト(✨NEW)
AIの支援により、マルチレベルヘッダーがついに横方向仮想リストをサポートしました！

`props.virtualX` を設定するだけです。
<demo react="basic/multi-header/MultiHeaderVirtualX.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/multi-header/MultiHeaderVirtualX.tsx"></demo>

::: tip
親ヘッダーノードに多くの子ノードがある場合は、仮想スクロールのパフォーマンス向上のためにヘッダーを分割してみてください。
:::


## 列固定
### 最も一般的な列固定
::: tip
マルチヘッダーテーブルでの固定列の値は現在のヘッダーノードにのみ影響します。親ヘッダーを固定したい場合は、fixedも設定する必要があります。
:::

```ts 
const columns: StkTableColumn<any>[] = [
    {
        dataIndex: '基本',
        title: '基本',
        fixed: 'left', // [!code ++]
        children: [
            { 
                dataIndex: 'id',
                title: 'ID',
                width: 100,
                fixed: 'left'  // [!code ++]
             },
            {
                dataIndex: 'lv2',
                title: 'Lv 2',
                width: 100,
                fixed: 'left', // [!code ++]
                children: [
                    { 
                        dataIndex: 'lv2_1',
                        title: 'Lv 2.1', 
                        width: 100, 
                        fixed: 'left'// [!code ++]
                    }, 
                    { 
                        dataIndex: 'lv2_2',
                        title: 'Lv 2.2', 
                        width: 100, 
                        fixed: 'left' // [!code ++]
                    }, 
                ],
            },
        ],
    },
]
```
<demo react="basic/multi-header/MultiHeaderFixed.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/multi-header/MultiHeaderFixed.tsx"></demo>
### リーフノード固定のみ設定

<demo react="basic/multi-header/MultiHeaderLeavesFixed.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/multi-header/MultiHeaderLeavesFixed.tsx"></demo>
::: warning 横方向仮想リスト(`props.virtualX`)はこのモードをサポートしていません。
:::

### 任意の固定を設定
<demo react="basic/multi-header/MultiHeaderAnyFixed.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/multi-header/MultiHeaderAnyFixed.tsx"></demo>
::: warning 横方向仮想リスト(`props.virtualX`)はこのモードをサポートしていません。
:::

楽しめましたか？これもsticky機能のおかげです。
