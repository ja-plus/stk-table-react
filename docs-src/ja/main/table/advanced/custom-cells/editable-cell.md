# EditableCell  編集可能セル<Badge type="warning" text="Beta" />

EditableCell は組み込みの編集可能セルコンポーネントです。セルをダブルクリックして編集モードに入り、キーボードで保存またはキャンセルできます。

### 基本的な使い方

`createEditableCell` ファクトリ関数で EditableCell コンポーネントを作成し、`customCell` として使用します。

<demo react="advanced/custom-cells/EditableCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/EditableCell/index.tsx"></demo>

### 設定オプション

`createEditableCell` は設定オブジェクトを受け取ります：

```ts
interface CreateEditableCellOptions {
    /** 編集をトリガーするイベント、デフォルト 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 値変更コールバック */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}
```

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| trigger | `'dblclick' \| 'click'` | `'dblclick'` | 編集をトリガーするイベントタイプ |
| onChange | `(newValue, row, dataIndex) => void` | - | 編集完了後のコールバック関数 |

### キーボード操作

編集モードで以下のキーボード操作がサポートされています：

| キー | 動作 |
|---|---|
| Enter | 保存して編集モードを終了 |
| Escape | 編集をキャンセルし、元の値に戻す |
| Tab | 保存して編集モードを終了 |
| 方向キー | 入力フィールド内でカーソルを移動（セルナビゲーションはトリガーされません） |
