# EditableCell  편집 가능 셀<Badge type="warning" text="Beta" />

EditableCell은 내장된 편집 가능 셀 컴포넌트입니다. 셀을 더블클릭하여 편집 모드로 진입하며, 키보드로 저장 또는 취소할 수 있습니다.

### 기본 사용법

`createEditableCell` 팩토리 함수로 EditableCell 컴포넌트를 생성하고 `customCell`로 사용합니다.

<demo react="advanced/custom-cells/EditableCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/EditableCell/index.tsx"></demo>

### 설정 옵션

`createEditableCell`은 설정 객체를 받습니다:

```ts
interface CreateEditableCellOptions {
    /** 편집을 트리거하는 이벤트, 기본값 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 값 변경 콜백 */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}
```

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| trigger | `'dblclick' \| 'click'` | `'dblclick'` | 편집을 트리거하는 이벤트 타입 |
| onChange | `(newValue, row, dataIndex) => void` | - | 편집 완료 후 콜백 함수 |

### 키보드 단축키

편집 모드에서 다음 키보드 단축키를 지원합니다:

| 키 | 동작 |
|---|---|
| Enter | 저장하고 편집 모드 종료 |
| Escape | 편집 취소, 원래 값 복원 |
| Tab | 저장하고 편집 모드 종료 |
| 방향키 | 입력 필드 내에서 커서 이동 (셀 네비게이션 트리거되지 않음) |
