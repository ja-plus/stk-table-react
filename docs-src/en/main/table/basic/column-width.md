# Column Width

## Basics
Set column width behavior through:
* `StkTableColumn['width']` : `number|string`
* `StkTableColumn['minWidth']` : `number|string`
* `StkTableColumn['maxWidth']` : `number|string`

When passing a `number` type, the unit is px.

String values with custom units like `%`, `em`, `ch` are also supported (**virtual lists only support px**).



::: info
Configuring `StkTableColumn['width']` will also configure `StkTableColumn['minWidth']` and `StkTableColumn['maxWidth']`.
:::

<demo react="basic/column-width/ColumnWidth.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/column-width/ColumnWidth.tsx"></demo>


## Table Not Full Width
The table in the component will fill the entire container. Therefore, if the `sum of all column widths` < `container width`, it will automatically adjust according to the proportion of the configured column widths to make the table fill the entire container. (This is also the default behavior of native tables)

If you want it not to fill the container, you can set `.stk-table-main` to `flex: none`.

<demo react="basic/column-width/TableWidthFit.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/column-width/TableWidthFit.tsx"></demo>

## Horizontal Virtual List
Column width control behavior differs between normal (non-virtual list) mode and virtual list mode.

When `props.virtual-x` (horizontal virtual list) is enabled, you **must** set column widths for calculation.

::: warning
Not setting column widths will set each column's width to `100`
:::

## Fixed Column Related Issues
If you find that the position of fixed columns is incorrect, please check if column widths are set. For details, see [Fixed Columns](/en/main/table/basic/fixed)

