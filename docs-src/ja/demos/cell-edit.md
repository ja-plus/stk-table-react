# セル編集

## 組み込みセル編集（`^1.0.0`）
テーブルには `createEditableCell` 編集可能セルプラグインが組み込まれており、ファクトリ関数で簡単に編集可能セルを作成できます。

詳細については、[EditableCell 編集可能セル](/ja/main/table/advanced/custom-cells/editable-cell) を参照してください。


## カスタム編集実装

より柔軟な編集ロジック（行編集モード、カスタム入力コンポーネントなど）が必要な場合は、`customCell` を使用して自分で実装できます。

以下はカスタムコンポーネントを使用した簡単な実装です：

* セルをダブルクリックして編集：`Enter` を押して保存、`Esc` を押すかブラーしてキャンセル。
* 行編集モード：編集行にチェックを入れて行編集モードに入ります。このモードでは保存するために `Enter` を押す必要がありません。

<demo react="demos/CellEdit/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/CellEdit/index.tsx"></demo>

::: tip change イベント
カスタム実装の場合、`EditCell` change イベントをイベントバス（[CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) / [mitt](https://www.npmjs.com/package/mitt)）またはその他の方法介して外部に通知できます。
:::
