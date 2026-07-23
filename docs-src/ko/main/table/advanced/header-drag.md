# 열 드래그 순서 변경

* `headerDrag` 속성을 설정하면 열 드래그 순서 변경 기능이 활성화됩니다.
* `columns` 설정은 `onUpdateColumns` 콜백으로 업데이트해야 합니다.

```js
<StkTable
    headerDrag // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

테이블 헤더를 드래그해 보세요

<demo react="advanced/header-drag/HeaderDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/header-drag/HeaderDrag.tsx"></demo>

## 이벤트를 통해 순서 변경
```ts
/**
 * 테이블 헤더 열 드래그 이벤트
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

이렇게 하면 `onUpdateColumns` 콜백으로 업데이트할 필요 없이, 수동으로 `columns` 배열의 순서만 업데이트하면 됩니다.

## API

### props.headerDrag

```ts
/** header drag config */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * 열 교환 모드
           * - none - 아무것도 안함
           * - insert - 삽입 (기본값)
           * - swap - 교환
           */
          mode?: 'none' | 'insert' | 'swap';
          /** 드래그 비활성화 열 */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### props
```ts
/**
 * 테이블 헤더 열 드래그 이벤트
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
/**
 * 테이블 헤더 열 드래그 시작
 * ```(dragStartKey: string)```
 */
onThDragStart?: (dragStartKey: string) => void;
/**
 * 테이블 헤더 열 드래그 drop
 * ```(targetColKey: string)```
 */
onThDrop?: (targetColKey: string) => void;
```
