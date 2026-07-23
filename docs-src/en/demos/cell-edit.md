# Cell Edit

## Built-in Cell Edit
The table includes a built-in `createEditableCell` editable cell plugin. Quickly create editable cells via the factory function.

For details, see [EditableCell](/en/main/table/advanced/custom-cells/editable-cell).


## Custom Implementation

If you need more flexible editing logic (such as row edit mode, custom input components, etc.), you can implement it yourself via `customCell`.

Here's a simple implementation using custom components:

* Double-click cell to edit: Press `Enter` to save, press `Esc` or blur to cancel.
* Row edit mode: Check the edit row to enter row edit mode. No need to press `Enter` to save in this mode.

<demo react="demos/CellEdit/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/CellEdit/index.tsx"></demo>

::: tip change Event
For custom implementations, you can notify the `EditCell` change event to the outside through an event bus ([CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) / [mitt](https://www.npmjs.com/package/mitt)) or other methods.
:::
