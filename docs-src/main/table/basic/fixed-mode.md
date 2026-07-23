# table-layout: fixed

## 配置
`props.fixedMode` 即可使 table-layout 为 fixed

## 示例
为了实现一列宽度固定，其余列平分的场景，我们需要借助原生 table-layout: fixed 的列宽等分的行为。

::: warning 
此模式仅生效 `StkTableColumn['width']`
:::

<demo react="basic/fixed-mode/FixedMode.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/fixed-mode/FixedMode.tsx"></demo>





