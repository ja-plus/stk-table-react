# ヘッダードラッグ

* `headerDrag` プロパティを設定して、列ドラッグ並べ替えを有効にします。
* `columns` は `onUpdateColumns` コールバックで更新する必要があります。

```js
<StkTable
    headerDrag // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

ヘッダーをドラッグしてみてください

<demo react="advanced/header-drag/HeaderDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/header-drag/HeaderDrag.tsx"></demo>

## イベントで順序を変更
```ts
/**
 * ヘッダー列ドラッグイベント
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

この方法では、`onUpdateColumns` コールバックで更新する必要はありません。`columns` 配列の順序を手動で更新できます。

## API

### props.headerDrag

```ts
/** ヘッダードラッグ設定 */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * 列交換モード
           * - none - 何もしない
           * - insert - 挿入（デフォルト）
           * - swap - 交換
           */
          mode?: 'none' | 'insert' | 'swap';
          /** ドラッグを無効にする列 */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### props
```ts
/**
 * ヘッダー列ドラッグイベント
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
/**
 * ヘッダー列ドラッグ開始
 * ```(dragStartKey: string)```
 */
onThDragStart?: (dragStartKey: string) => void;
/**
 * ヘッダー列ドラッグドロップ
 * ```(targetColKey: string)```
 */
onThDrop?: (targetColKey: string) => void;
```
