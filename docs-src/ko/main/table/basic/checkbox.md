# 다중 선택상자
## 내장 확장 기능 사용
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 직접 구현

`customCell`과 `customHeaderCell` 설정 항목을 통해 다중 선택상자 기능을 구현합니다. 이 방식은 매우 유연하여 다양한 비즈니스 요구를 충족시킬 수 있습니다.
## 예시

<demo react="basic/checkbox/Checkbox.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/checkbox/Checkbox.tsx"></demo>

## 코드 구현

columns 설정에 다중 선택상자를 표시하는 커스텀 열을 추가합니다:

```javascript
{
    customHeaderCell: () => (
        <span>
            <input
                type="checkbox"
                style={{ verticalAlign: 'middle' }}
                checked={isCheckAll}
                ref={el => {
                    if (el) el.indeterminate = isCheckPartial;
                }}
                onChange={e => toggleAll(e.target.checked)}
            />
        </span>
    ),
    customCell: ({ row }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input type="checkbox" checked={!!row._isChecked} onChange={e => toggleRow(row.id, e.target.checked)} />
        </div>
    ),
}
```
input 요소 외부에 부모 요소를 추가하여 수직 중앙 정렬합니다.

프로젝트에서 사용하는 React 컴포넌트 라이브러리 (Ant Design, Material UI, Chakra UI 등) 의 `Checkbox` 컴포넌트로 대체하여 프로젝트 전체 스타일 통일을 유지할 수 있습니다.
