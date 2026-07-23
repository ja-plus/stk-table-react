# 单元格编辑

## 内置的单元格编辑
表格内置了 `createEditableCell` 可编辑单元格插件，通过工厂函数快速创建可编辑单元格。

详情请参考 [EditableCell 可编辑单元格](/main/table/advanced/custom-cells/editable-cell)。


## 自定义编辑实现

如果需要更灵活的编辑逻辑（如行编辑模式、自定义输入组件等），可以通过 `customCell` 自行实现。

以下是使用自定义组件的简易实现：

* 双击单元格编辑： 按 `Enter` 保存，按 `Esc` 或 blur 取消。
* 行编辑模式：勾选编辑行，进入行编辑模式。此模式无需 `Enter` 保存。

<demo react="demos/CellEdit/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/CellEdit/index.tsx"></demo>

::: tip change 事件
自定义实现时，您可以通过事件总线 ([CustomEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/CustomEvent) / [mitt](https://www.npmjs.com/package/mitt)) 等方式，将 `EditCell` 的 change 事件通知到外部。
:::
