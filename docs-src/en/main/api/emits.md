# Events

## API

### onSortChange

Triggered when sorting changes. When defaultSort.dataIndex is not found, col will return null.

```ts
onSortChange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onRowClick

Click event for a row.

```ts
onRowClick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCurrentChange

Triggered when a row is selected. ev returns null if not triggered by a click event.

```ts
onCurrentChange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### onCellSelected

Triggered when a cell is selected. ev returns null if not triggered by a click event.

```ts
onCellSelected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onRowDblclick

Double click event for a row.

```ts
onRowDblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onHeaderRowMenu

Right click event for table header.

```ts
onHeaderRowMenu?: (ev: MouseEvent) => void;
```

### onRowMenu

Right click event for table body row.

```ts
onRowMenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCellClick

Click event for a cell.

```ts
onCellClick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onCellMouseenter

Mouse enter event for a cell.

```ts
onCellMouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseleave

Mouse leave event for a cell.

```ts
onCellMouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseover

Mouse over event for a cell.

```ts
onCellMouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMousedown

Mouse down event for a cell.

```ts
onCellMousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onHeaderCellClick

Click event for header cell.

```ts
onHeaderCellClick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### onScroll

Table scroll event.

```ts
onScroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onScrollX

Table horizontal scroll event.

```ts
onScrollX?: (ev: Event) => void;
```

### onColOrderChange

Header column drag event.

```ts
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

### onThDragStart

Header column drag start.

```ts
onThDragStart?: (dragStartKey: string) => void;
```

### onThDrop

Header column drag drop.

```ts
onThDrop?: (targetColKey: string) => void;
```

### onRowOrderChange

Row drag event.

```ts
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```

### onColResize

Triggered when column width changes.

```ts
onColResize?: (col: StkTableColumn<DT>) => void;
```

### onFilterChange

Triggered when filter status changes. This callback is only triggered when calling the `setFilter` method to set the filter status.

```ts
onFilterChange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### onToggleRowExpand

Triggered when expanding a row.

```ts
onToggleRowExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onToggleTreeExpand

Triggered when clicking to expand a tree row.

```ts
onToggleTreeExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onAreaSelectionChange

Area selection change event.

```ts
onAreaSelectionChange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

Cell selection range type. Each range describes the cells covered in the table via the `index` field.

```ts
type AreaSelectionRange = {
    index: {
        /** Column index range [startCol, endCol] (both ends inclusive) @deprecated Use begin/end instead */
        x: [number, number];
        /** Row index range [startRow, endRow] (both ends inclusive) @deprecated Use begin/end instead */
        y: [number, number];
        /** Start point index of the selection */
        begin: { row: number; col: number };
        /** End point index of the selection */
        end: { row: number; col: number };
    };
};
```

| Field | Type | Description |
| --- | --- | --- |
| index.x | `[number, number]` | Column index range covered by the selection, `[startCol, endCol]`, both ends inclusive. Deprecated, use begin/end instead |
| index.y | `[number, number]` | Row index range covered by the selection, `[startRow, endRow]`, both ends inclusive. Deprecated, use begin/end instead |
| index.begin | `{ row: number; col: number }` | Start point index of the selection |
| index.end | `{ row: number; col: number }` | End point index of the selection |

When using Ctrl multi-select or Shift range-select, `ranges` may contain multiple selection ranges.

### onUpdateColumns

Update width when onUpdateColumns col is resized.

```ts
onUpdateColumns?: (cols: StkTableColumn<DT>[]) => void;
```
