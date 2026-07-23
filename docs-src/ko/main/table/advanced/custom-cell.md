# 사용자 정의 셀

* `StkTableColumn['customCell']`로 **본문** 셀 내용을 사용자 정의합니다.
* `StkTableColumn['customHeaderCell']`로 **헤더** 셀 내용을 사용자 정의합니다.

`customCell`과 `customHeaderCell`의 사용법은 기본적으로 동일합니다. 여기서는 `customCell`을 예로 들어 설명합니다.

::: warning 권장 사항
* `customCell`은 요소(div, span 등)로 감싸는 것을 권장합니다. 그렇지 않으면 &lt;td&gt;의 자식 노드가 `TextNode`가 되어 레이아웃 문제가 발생할 수 있습니다.
* `customCell`의 루트 요소에 `inline`/`inline-block`/`inline-flex` 등의 인라인 요소를 설정할 때는 **신중하게** 하세요. 이 레이아웃은 **가상 리스트**에서 행 높이를 늘릴 수 있습니다.
:::

### React 컴포넌트로 사용
React 컴포넌트를 전달할 수 있습니다. 컴포넌트의 props는 `CustomCellProps` 타입으로 특별히 정의해야 합니다.

::: tip 모범 사례
 columns는 별도의 파일에 작성하여 내보내세요.
:::

::: code-group
```ts [column.ts]
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';
import type { DataType } from './types';
import YieldCell from './YieldCell';
export const columns: StkTableColumn<DataType> = [{
    title: '수익률',
    dataIndex: 'yield',
    customCell: YieldCell
}]
```
```tsx [YieldCell.tsx]
import type { CustomCellProps } from 'stk-table-react/src/StkTable/index';
import type { DataType } from './types';

export default function YieldCell(props: CustomCellProps<DataType>) {
    let className = '';
    if (props.cellValue > 0) {
        className = 'color-up';
    } else if (props.cellValue < 0) {
        className = 'color-down';
    }
    return (
        <span className={className}>
            {props.cellValue > 0 ? '+' : ''}
            {(props.cellValue * 100).toFixed(4)}%
        </span>
    );
}
```
```ts [types.ts]
export type DataType = {
    name: string;
    yield: number;
};

```
```css [style.css]
.color-up {
    color: #2fc87b;
}
.color-down {
    color: #ff2b48;
}
```
:::

<demo react="advanced/custom-cell/CustomCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cell/CustomCell/index.tsx"></demo>

### JSX로 사용
`customCell`은 JSX를 직접 반환할 수도 있어 간단한 변경에便利です.

예를 들어 숫자에 **100을 곱하고** **단위**를 추가합니다.
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: '수익률',
        dataIndex: 'yield',
        customCell: ({ cellValue }) => <span>{cellValue * 100}%</span>,
    },
]
```

셀 값에 따라 스타일을 설정할 수도 있습니다:
```tsx
import { StkTableColumn } from 'stk-table-react/src/StkTable/index';

const columns: StkTableColumn<any>[] = [
    {
        title: '이름',
        dataIndex: 'name',
        customCell: ({ row, col, cellValue }) => {
            return <span style={{ color: 'red' }}>{cellValue}</span>;
        },
    },
]
```



## API
| 속성 | props | 기본값 | 설명 |
|---|---|---|---|
| customCell | ComponentType&lt;CustomCellProps&gt; | - | 사용자 정의 셀 렌더링 컴포넌트 |
| customHeaderCell | ComponentType&lt;CustomHeaderCellProps&gt; | - | 사용자 정의 헤더 셀 렌더링 컴포넌트 |

### types
customCell props 타입
```ts
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex]의 값 */
    cellValue: any;
    rowIndex: number;
    /** 
     * 열 인덱스(0부터 시작)
     * 
     * 주의:
     * virtual-x에서는 가상 리스트 내의 열 인덱스를 나타냅니다
     */
    colIndex: number;
    /**
     * 현재 행이 확장되었는지 여부
     * - 확장되지 않음: null
     * - 확장됨: column 설정을 반환
     */
    expanded?: StkTableColumn<any>;
    /** 트리 노드의 현재 행이 확장되었는지 여부 */
    treeExpanded?: boolean;
};

export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    /** 
     * 열 인덱스(0부터 시작)
     * 
     * 주의:
     * virtual-x에서는 가상 리스트 내의 열 인덱스를 나타냅니다
     */
    colIndex: number;
};



```
