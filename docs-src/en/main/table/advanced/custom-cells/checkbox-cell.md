# CheckboxCell <Badge type="warning" text="Beta" />

CheckboxCell is a built-in checkbox cell component that supports select-all and indeterminate states at the cell level.

### Basic Usage

Create `CheckboxCell` and `CheckboxAllCell` components via the `createCheckboxCell` factory function, and use them as `customCell` and `customHeaderCell` respectively.

<demo react="advanced/custom-cells/CheckboxCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/CheckboxCell/index.tsx"></demo>

### Using Third-party Components

You can pass a UI library's Checkbox component via `checkboxComponent` to maintain consistent styling.

<demo react="advanced/custom-cells/CheckboxCell/CheckboxComponentCell.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/CheckboxCell/CheckboxComponentCell.tsx"></demo>

### createCheckboxCell Options

The `createCheckboxCell` factory function accepts a configuration object:

```ts
interface createCheckboxCellOptions<T = any> {
    /** Field name in row data for checked state, default '_isChecked' */
    field?: string;
    /** Custom checkbox component (e.g., Ant Design / Material UI Checkbox) */
    checkboxComponent?: any;
    /** Cell checkbox state change callback */
    onChange?: (checked: boolean, row: T) => void;
    /** Select all checkbox state change callback */
    onSelectAll?: (checked: boolean) => void;
}
```

| Property | Type | Default | Description |
|---|---|---|---|
| field | `string` | `'_isChecked'` | Field name in row data for checked state |
| checkboxComponent | `Component` | - | Custom checkbox component, uses native input[type=checkbox] if not provided |
| onChange | `(checked, row) => void` | - | Callback when cell checkbox state changes |
| onSelectAll | `(checked) => void` | - | Callback when select all checkbox state changes |
