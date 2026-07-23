# 行拖动更换顺序

拖动行，改变行在表格中的顺序。

## 示例
使用内置的拖动 `StkTableColumn['type']="dragRow"`

::: warning
 `dragRow` 的列配置里没有写 `dataIndex`, 因为通过 `props.colKey` 重写了唯一键，优先取 `StkTableColumn['key']` 字段。
:::

<demo react="advanced/row-drag/RowDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDrag.tsx"></demo>

也可以自己通过原生 draggable API 来实现，下面是参考：

<demo react="advanced/row-drag/RowDragCustom.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDragCustom.tsx"></demo>

## API

### props
```ts
/**
 * 行拖动事件
 *
 * ```(dragStartKey: string, targetRowKey: string)```
 */
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```

