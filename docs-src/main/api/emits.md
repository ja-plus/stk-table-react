# Events 事件

## API

### onSortChange

排序变更触发。defaultSort.dataIndex 找不到时，col 将返回 null。

```ts
onSortChange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onRowClick

一行点击事件。

```ts
onRowClick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCurrentChange

选中一行触发。ev 返回 null 表示不是点击事件触发的。

```ts
onCurrentChange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### onCellSelected

选中单元格触发。ev 返回 null 表示不是点击事件触发的。

```ts
onCellSelected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onRowDblclick

行双击事件。

```ts
onRowDblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onHeaderRowMenu

表头右键事件。

```ts
onHeaderRowMenu?: (ev: MouseEvent) => void;
```

### onRowMenu

表体行右键点击事件。

```ts
onRowMenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCellClick

单元格点击事件。

```ts
onCellClick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onCellMouseenter

单元格鼠标进入事件。

```ts
onCellMouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseleave

单元格鼠标移出事件。

```ts
onCellMouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseover

单元格悬浮事件。

```ts
onCellMouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMousedown

单元格鼠标按下事件。

```ts
onCellMousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onHeaderCellClick

表头单元格点击事件。

```ts
onHeaderCellClick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### onScroll

表格滚动事件。

```ts
onScroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onScrollX

表格横向滚动事件。

```ts
onScrollX?: (ev: Event) => void;
```

### onColOrderChange

表头列拖动事件。

```ts
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

### onThDragStart

表头列拖动开始。

```ts
onThDragStart?: (dragStartKey: string) => void;
```

### onThDrop

表头列拖动 drop。

```ts
onThDrop?: (targetColKey: string) => void;
```

### onRowOrderChange

行拖动事件。

```ts
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```

### onColResize

列宽变动时触发。

```ts
onColResize?: (col: StkTableColumn<DT>) => void;
```

### onFilterChange

筛选状态变更时触发。通过调用 `setFilter` 方法设置筛选状态时才会触发此回调。

```ts
onFilterChange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### onToggleRowExpand

展开行触发。

```ts
onToggleRowExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onToggleTreeExpand

点击展开树行触发。

```ts
onToggleTreeExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onAreaSelectionChange

单元格选区变更事件。

```ts
onAreaSelectionChange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

单元格选区范围类型。每个选区通过 `index` 字段描述在表格中覆盖的单元格范围。

```ts
type AreaSelectionRange = {
    index: {
        /** 列索引范围 [起始列, 结束列]（包含两端） @deprecated 请使用 begin/end */
        x: [number, number];
        /** 行索引范围 [起始行, 结束行]（包含两端） @deprecated 请使用 begin/end */
        y: [number, number];
        /** 选区起始点索引 */
        begin: { row: number; col: number };
        /** 选区结束点索引 */
        end: { row: number; col: number };
    };
};
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index.x | `[number, number]` | 选区覆盖的列索引范围，`[起始列, 结束列]`，包含两端。已废弃，请使用 begin/end |
| index.y | `[number, number]` | 选区覆盖的行索引范围，`[起始行, 结束行]`，包含两端。已废弃，请使用 begin/end |
| index.begin | `{ row: number; col: number }` | 选区起始点索引 |
| index.end | `{ row: number; col: number }` | 选区结束点索引 |

当使用 Ctrl 多选或 Shift 扩选时，`ranges` 可能包含多个选区。

### onUpdateColumns

onUpdateColumns col resize 时更新宽度。

```ts
onUpdateColumns?: (cols: StkTableColumn<DT>[]) => void;
```
