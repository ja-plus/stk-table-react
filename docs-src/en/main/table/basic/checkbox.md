# Checkbox
## Using Built-in Extension
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## Custom Implementation

Implement checkbox functionality through `customCell` and `customHeaderCell` configuration options. This approach is very flexible and can meet different business requirements.
## Example

<demo react="basic/checkbox/Checkbox.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/checkbox/Checkbox.tsx"></demo>

## Code Implementation

Add a custom column to the columns configuration to display checkboxes:

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
Wrap the input element in a parent element for vertical centering.

You can replace the `input` with the `Checkbox` component from the React component library used in your project (Ant Design, Material UI, Chakra UI, etc.) to maintain a consistent style throughout the project.