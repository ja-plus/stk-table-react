# チェックボックス
## 組み込み拡張機能を使用 <Badge type="tip" text="^1.0.0" />
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 独自実装

`customCell` と `customHeaderCell` 設定オプションを通じてチェックボックス機能を実装します。このアプローチは非常に柔軟で、異なるビジネス要件を満たすことができます。
## 例

<demo react="basic/checkbox/Checkbox.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/checkbox/Checkbox.tsx"></demo>

## コード実装

列設定にカスタム列を追加してチェックボックスを表示します：

```javascript
{
  customHeaderCell: () => (
    <span>
        <input
            type="checkbox"
            style={{ verticalAlign: 'middle' }}
            checked={isCheckAll}
            ref={el => {
                if (el) el.indeterminate = isCheckPartial;
            }}
            onChange={e => toggleAll(e.target.checked)}
        />
    </span>
  ),
  customCell: ({ row }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input type="checkbox" checked={!!row._isChecked} onChange={e => toggleRow(row.id, e.target.checked)} />
    </div>
  ),
}
```

input要素を垂直方向の中央配置のために親要素でラップします。

プロジェクトのReactコンポーネントライブラリ（Ant Design、Material UI、Chakra UIなど）から `Checkbox` コンポーネントに `input` を置き換えて、プロジェクト全体で一貫したスタイルを維持できます。
