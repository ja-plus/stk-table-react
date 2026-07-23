# EditableCell 可编辑单元格 <Badge type="warning" text="Beta" />

EditableCell 是一个内置的可编辑单元格组件，双击单元格即可进入编辑模式，支持键盘操作保存或取消。

### 基础使用

通过 `createEditableCell` 工厂函数创建 EditableCell 组件，并将其作为 `customCell` 使用。

<demo react="advanced/custom-cells/EditableCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/EditableCell/index.tsx"></demo>

### 配置选项

`createEditableCell` 接受一个配置对象：

```ts
interface CreateEditableCellOptions {
    /** 触发编辑的事件，默认 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 值变更回调 */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}
```

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| trigger | `'dblclick' \| 'click'` | `'dblclick'` | 触发编辑的事件类型 |
| onChange | `(newValue, row, dataIndex) => void` | - | 编辑完成后的回调函数 |

### 键盘操作

编辑模式下支持以下键盘操作：

| 按键 | 行为 |
|---|---|
| Enter | 保存并退出编辑 |
| Escape | 取消编辑，恢复原值 |
| Tab | 保存并退出编辑 |
| 方向键 | 在输入框内移动光标（不会触发单元格导航） |
