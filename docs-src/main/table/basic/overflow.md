# 溢出内容省略

## 基本

*  `props.showOverflow` 为 true，当内容溢出时，会显示省略号。
*  `props.showHeaderOverflow` 为 true，当表头内容溢出时，会显示省略号。

::: tip
当开启虚拟列表时，为了不影响计算，行高不会被单元格内容影响，并固定至 `props.rowHeight` & `props.headerRowHeight` 配置的行高。
:::


<demo react="basic/overflow/Overflow.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/overflow/Overflow.tsx"></demo>