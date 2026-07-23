# Row Drag to Change Order

Drag rows to change their order in the table.

## Example
Use built-in drag with `StkTableColumn['type']="dragRow"`

::: warning
`dataIndex` is not specified in the column configuration for `dragRow` because the unique key is overridden by `props.colKey`, and the `StkTableColumn['key']` field is prioritized.
:::

<demo react="advanced/row-drag/RowDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDrag.tsx"></demo>

You can also implement it yourself using the native draggable API, here's a reference:

<demo react="advanced/row-drag/RowDragCustom.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/row-drag/RowDragCustom.tsx"></demo>

## API

### props
```ts
/**
 * Row drag event
 *
 * ```(dragStartKey: string, targetRowKey: string)```
 */
onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
```

