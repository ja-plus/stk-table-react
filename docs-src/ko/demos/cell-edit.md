# 셀 편집

## 내장 셀 편집 (`^1.0.0`)
테이블에는 `createEditableCell` 편집 가능 셀 플러그인이 내장되어 있어 팩토리 함수로 쉽게 편집 가능 셀을 생성할 수 있습니다.

자세한 내용은 [EditableCell 편집 가능 셀](/ko/main/table/advanced/custom-cells/editable-cell)을 참조하세요.


## 사용자 정의 편집 구현

행 편집 모드, 사용자 정의 입력 컴포넌트 등 더 유연한 편집 로직이 필요한 경우 `customCell`을 통해 직접 구현할 수 있습니다.

다음은 사용자 정의 컴포넌트를 사용한 간단한 구현입니다:

* 셀을 더블 클릭하여 편집: `Enter` 를 눌러 저장, `Esc` 를 누르거나 blur 하여 취소.
* 행 편집 모드: 편집 행에 체크하여 행 편집 모드로 진입합니다. 이 모드에서는 저장하기 위해 `Enter` 를 누를 필요가 없습니다.

<demo react="demos/CellEdit/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/CellEdit/index.tsx"></demo>

::: tip change 이벤트
사용자 정의 구현의 경우, 이벤트 버스 ([CustomEvent](https://developer.mozilla.org/ko/docs/Web/API/CustomEvent/CustomEvent) / [mitt](https://www.npmjs.com/package/mitt)) 또는 기타 방법을 통해 `EditCell` 의 change 이벤트를 외부에 알릴 수 있습니다.
:::
