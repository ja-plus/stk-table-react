# 열 너비 조정

## 설정
* `props.colResizable` 를 설정하면 열 너비 조정이 활성화됩니다.
* `props.columns` 는 `onUpdateColumns` 콜백으로 업데이트해야 하며, 열 너비가 수정되면 직접 `StkTableColumn['width']` 값이 변경됩니다.
* `columns` 는 반응형 업데이트를 지원하려면 `useState` 로 저장해야 합니다.

```js
<StkTable
    colResizable // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

::: warning
열 너비 조정을 활성화하면, 열 너비가 기본적으로 컨테이너를 채우지 않습니다.
:::

<demo react="advanced/column-resize/ColResizable.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/column-resize/ColResizable.tsx"></demo>


## 이벤트를 통해 열 너비 변경
```ts
/**
 * 열 너비 변경 시 트리거
 *
 *  ```(col: StkTableColumn<DT>)```
 */
onColResize?: (col: StkTableColumn<DT>) => void;
```

이렇게 하면 `onUpdateColumns` 콜백으로 업데이트할 필요 없이, 수동으로 `StkTableColumn['width']` 값만 업데이트하면 됩니다.

## 열 너비 컨테이너 채우기 hack 방식
열 너비가 컨테이너를 채우길 원하시면 CSS 로 `.stk-table-main` 을 `flex: 1` 로 설정하면 테이블이 컨테이너를 채웁니다.

그런 다음 특정 열의 `width` 를 `minWidth` 로 변경하면 이 열이 자동으로 나머지 너비를 차지하고, 다른 열은 여전히 설정된 너비가 됩니다.

`props.colResizable.disabled` 로 마지막 열의 드래그 열 너비 조정을 비활성화합니다.

아래 데모는 마지막 열의 minWidth 를 설정했습니다.
<demo react="advanced/column-resize/ColResizableFullHack.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/column-resize/ColResizableFullHack.tsx"></demo>


## API
### props.colResizable:
| type | 설명 |
| --- | --- | 
| boolean | 열 너비 조정 활성화 여부  |
| ColResizableConfig | 설정 |

### ColResizableConfig
| 속성 | 타입 | 기본값| 설명 |
| --- | --- | ---- | --- |
| disabled | `(col:StkTableColumn) => boolean` | -- | 열 너비 조정 활성화 여부 |
