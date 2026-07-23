# Events

## API

### onSortChange

排序が変更されたときにトリガーされます。defaultSort.dataIndexが見つからない場合、colはnullを返します。

```ts
onSortChange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onRowClick

行のクリックイベント。

```ts
onRowClick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCurrentChange

行が選択されたときにトリガーされます。evはクリックイベントでトリガーされていない場合はnullを返します。

```ts
onCurrentChange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### onCellSelected

セルが選択されたときにトリガーされます。evはクリックイベントでトリガーされていない場合はnullを返します。

```ts
onCellSelected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onRowDblclick

行のダブルクリックイベント。

```ts
onRowDblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onHeaderRowMenu

テーブルヘッダーの右クリックイベント。

```ts
onHeaderRowMenu?: (ev: MouseEvent) => void;
```

### onRowMenu

テーブルボディ行の右クリックイベント。

```ts
onRowMenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCellClick

セルのクリックイベント。

```ts
onCellClick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onCellMouseenter

セルのマウスエンターイベント。

```ts
onCellMouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseleave

セルのマウスリーブイベント。

```ts
onCellMouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseover

セルのマウスオーバイベント。

```ts
onCellMouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMousedown

セルのマウストラッグイベント。

```ts
onCellMousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onHeaderCellClick

ヘッダーセルのクリックイベント。

```ts
onHeaderCellClick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### onScroll

テーブルスクロールイベント。

```ts
onScroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onScrollX

テーブル横スクロールイベント。

```ts
onScrollX?: (ev: Event) => void;
```

### onColOrderChange

ヘッダー列ドラッグイベント。

```ts
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

### onThDragStart

ヘッダー列ドラッグ開始。

```ts
onThDragStart?: (dragStartKey: string) => void;
```

### onThDrop

ヘッダー列ドラッグドロップ。

```ts
onThDrop?: (targetColKey: string) => void;
```

### onRowOrderChange

行ドラッグイベント。

```ts
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```

### onColResize

列幅が変更されたときにトリガーされます。

```ts
onColResize?: (col: StkTableColumn<DT>) => void;
```

### onFilterChange

フィルター状態が変更されたときにトリガーされます。`setFilter` メソッドを呼び出してフィルター状態を設定したときにのみこのコールバックがトリガーされます。

```ts
onFilterChange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### onToggleRowExpand

行を展開ときにトリガーされます。

```ts
onToggleRowExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onToggleTreeExpand

ツリー行を展開するためにクリックしたときにトリガーされます。

```ts
onToggleTreeExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onAreaSelectionChange

エリア選択変更イベント。

```ts
onAreaSelectionChange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

セル選択範囲の型。各選択範囲は `index` フィールドでテーブル内のセル範囲を表します。

```ts
type AreaSelectionRange = {
    index: {
        /** 列インデックス範囲 [開始列, 終了列]（両端を含む） @deprecated begin/endを使用してください */
        x: [number, number];
        /** 行インデックス範囲 [開始行, 終了行]（両端を含む） @deprecated begin/endを使用してください */
        y: [number, number];
        /** 選択範囲の開始点インデックス */
        begin: { row: number; col: number };
        /** 選択範囲の終了点インデックス */
        end: { row: number; col: number };
    };
};
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| index.x | `[number, number]` | 選択範囲が覆う列インデックス範囲、`[開始列, 終了列]`、両端を含む。非推奨、begin/endを使用してください |
| index.y | `[number, number]` | 選択範囲が覆う行インデックス範囲、`[開始行, 終了行]`、両端を含む。非推奨、begin/endを使用してください |
| index.begin | `{ row: number; col: number }` | 選択範囲の開始点インデックス |
| index.end | `{ row: number; col: number }` | 選択範囲の終了点インデックス |

Ctrl 複数選択または Shift 範囲選択を使用する場合、`ranges` には複数の選択範囲が含まれる可能性があります。

### onUpdateColumns

onUpdateColumns列のサイズ変更時に幅を更新します。

```ts
onUpdateColumns?: (cols: StkTableColumn<DT>[]) => void;
```
