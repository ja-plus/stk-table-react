# Events 이벤트

## API

### onSortChange

정렬 변경 시トリ거. defaultSort.dataIndex를 찾을 수 없으면 col은 null 반환.

```ts
onSortChange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
```

### onRowClick

행 클릭 이벤트.

```ts
onRowClick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCurrentChange

행 선택 시トリ거. ev가 null 반환되면 클릭 이벤트가 아닌 것을 의미.

```ts
onCurrentChange?: (ev: MouseEvent | null, row: DT | undefined, data: { select: boolean }) => void;
```

### onCellSelected

셀 선택 시トリ거. ev가 null 반환되면 클릭 이벤트가 아닌 것을 의미.

```ts
onCellSelected?: (ev: MouseEvent | null, data: { select: boolean; row: DT | undefined; col: StkTableColumn<DT> | undefined }) => void;
```

### onRowDblclick

행 더블 클릭 이벤트.

```ts
onRowDblclick?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onHeaderRowMenu

헤더 우클릭 이벤트.

```ts
onHeaderRowMenu?: (ev: MouseEvent) => void;
```

### onRowMenu

본문 행 우클릭 이벤트.

```ts
onRowMenu?: (ev: MouseEvent, row: DT, data: { rowIndex: number }) => void;
```

### onCellClick

셀 클릭 이벤트.

```ts
onCellClick?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onCellMouseenter

셀 마우스 진입 이벤트.

```ts
onCellMouseenter?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseleave

셀 마우스 이탈 이벤트.

```ts
onCellMouseleave?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMouseover

셀 호버 이벤트.

```ts
onCellMouseover?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
```

### onCellMousedown

셀 마우스 누름 이벤트.

```ts
onCellMousedown?: (ev: MouseEvent, row: DT, col: StkTableColumn<DT>, data: { rowIndex: number }) => void;
```

### onHeaderCellClick

헤더 셀 클릭 이벤트.

```ts
onHeaderCellClick?: (ev: MouseEvent, col: StkTableColumn<DT>) => void;
```

### onScroll

테이블 스크롤 이벤트.

```ts
onScroll?: (ev: Event, data: { startIndex: number; endIndex: number }) => void;
```

### onScrollX

테이블 가로 스크롤 이벤트.

```ts
onScrollX?: (ev: Event) => void;
```

### onColOrderChange

헤더 열 드래그 이벤트.

```ts
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

### onThDragStart

헤더 열 드래그 시작.

```ts
onThDragStart?: (dragStartKey: string) => void;
```

### onThDrop

헤더 열 드래그 드롭.

```ts
onThDrop?: (targetColKey: string) => void;
```

### onRowOrderChange

행 드래그 이벤트.

```ts
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```

### onColResize

열 너비 변경 시トリガー.

```ts
onColResize?: (col: StkTableColumn<DT>) => void;
```

### onFilterChange

필터 상태 변경 시 트리거됩니다. `setFilter` 메서드를 호출하여 필터 상태를 설정할 때만 이 콜백이 트리거됩니다.

```ts
onFilterChange?: (status: Record<UniqKey, FilterStatus>) => void;
```

### onToggleRowExpand

확장 행 트리거.

```ts
onToggleRowExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onToggleTreeExpand

트리 행 확장 클릭 트리거.

```ts
onToggleTreeExpand?: (data: { expanded: boolean; row: DT; col: StkTableColumn<DT> | null }) => void;
```

### onAreaSelectionChange

셀 선택 영역 변경 이벤트.

```ts
onAreaSelectionChange?: (ranges: AreaSelectionRange[]) => void;
```

#### AreaSelectionRange

셀 선택 영역 타입. 각 선택 영역은 `index` 필드를 통해 테이블 내에서 덮는 셀 범위를 설명합니다.

```ts
type AreaSelectionRange = {
    index: {
        /** 열 인덱스 범위 [시작 열, 끝 열] (양쪽 끝 포함) @deprecated begin/end를 사용하세요 */
        x: [number, number];
        /** 행 인덱스 범위 [시작 행, 끝 행] (양쪽 끝 포함) @deprecated begin/end를 사용하세요 */
        y: [number, number];
        /** 선택 영역 시작점 인덱스 */
        begin: { row: number; col: number };
        /** 선택 영역 끝점 인덱스 */
        end: { row: number; col: number };
    };
};
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| index.x | `[number, number]` | 선택 영역이 덮는 열 인덱스 범위, `[시작 열, 끝 열]`, 양쪽 끝 포함. 사용 중단, begin/end를 사용하세요 |
| index.y | `[number, number]` | 선택 영역이 덮는 행 인덱스 범위, `[시작 행, 끝 행]`, 양쪽 끝 포함. 사용 중단, begin/end를 사용하세요 |
| index.begin | `{ row: number; col: number }` | 선택 영역 시작점 인덱스 |
| index.end | `{ row: number; col: number }` | 선택 영역 끝점 인덱스 |

Ctrl 다중 선택 또는 Shift 범위 선택을 사용할 때 `ranges`에는 여러 선택 영역이 포함될 수 있습니다.

### onUpdateColumns

onUpdateColumns col resize 시 너비 업데이트.

```ts
onUpdateColumns?: (cols: StkTableColumn<DT>[]) => void;
```
