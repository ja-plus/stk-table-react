# 행 드래그 순서 변경

행을 드래그하여 테이블에서의 순서를 변경합니다.

## 예시
내장된 드래그 `StkTableColumn['type']="dragRow"` 사용

::: warning
 `dragRow` 열 설정에는 `dataIndex`가 작성되지 않았습니다. 이는 `props.colKey` 가 유일한 키를 재정의했고, `StkTableColumn['key']` 필드가 우선적으로 사용되기 때문입니다.
:::

<demo react="advanced/row-drag/RowDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDrag.tsx"></demo>

또한 네이티브 draggable API 를 사용하여 구현할 수도 있으며, 아래는 참고입니다:

<demo react="advanced/row-drag/RowDragCustom.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDragCustom.tsx"></demo>

## API

### props
```ts
/**
 * 행 드래그 이벤트
 *
 * ```(dragStartKey: string, targetRowKey: string)```
 */
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```
