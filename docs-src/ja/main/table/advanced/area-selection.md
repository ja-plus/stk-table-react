# エリア選択 <Badge type="tip" text="^0.10.0" /> <Badge type="warning" text="登録が必要" /> 
`props.areaSelection` を介してテーブルセルドラッグ選択を有効にします。
- クリップボードへのコピーをサポート（Ctrl/Cmd + C）。
- Esc で選択をキャンセル
- キーボード選択をサポート（矢印キー、Shift、Tab）。
- Ctrl 複数選択をサポート（設定可能）
- Shift 拡張選択をサポート（設定可能）

::: tip 登録が必要です 
この機能を使用する前に登録が必要です。
:::
登録方法：
```ts
import { registerFeature, useAreaSelection } from 'stk-table-react';
// エリア選択機能を登録
registerFeature(useAreaSelection);
```



```js
<StkTable
    area-selection // [!code ++]
></StkTable>
```

<demo react="advanced/area-selection/AreaSelection.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/area-selection/AreaSelection.tsx"></demo>

## Props
- [`areaSelection`](/ja/main/api/table-props.md#areaselection)

## Emit
- [エリア選択が変更されたときにトリガー - area-selection-change](/ja/main/api/emits.html#area-selection-change) 

## Exposed
- [getSelectedArea](/ja/main/api/expose.md#getselectedarea)
- [setAreaSelection](/ja/main/api/expose.md#setareaselection)
- [clearSelectedArea](/ja/main/api/expose.md#clearselectedarea)
- [copySelectedArea](/ja/main/api/expose.md#copyselectedarea)
