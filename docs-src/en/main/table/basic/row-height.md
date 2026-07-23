# Row Height

* `props.rowHeight` sets the body row height, default is `28px`.
* `props.headerRowHeight` sets the header row height, default is `28px`.
* `props.footerRowHeight` sets the footer row height, default is `28px`.

## Example
The following sets the header row height to `50px` and the body row height to `40px`.
```tsx
<StkTable rowHeight={40} headerRowHeight={50} />
```
::: info
In **normal** (non-virtual list) mode, if content exceeds the row height, it will expand the row height.

In **virtual list** mode, the row height is always the set value.
:::

<demo react="basic/row-height/RowHeight.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/row-height/RowHeight.tsx"></demo>

When virtual list is enabled, scrolling may cause column width changes, which is due to not setting column widths.


## Flexible Row Height
First, the height of the `<StkTable>` component must be sufficient. You can place it in a flexible layout like `flex` or `grid`, or set its height to `100%`, so that its parent element determines its height instead of being expanded by child elements.

Second, set the `flex` of `.stk-table .stk-table-scroll-container` to `1`

As follows

```css
:deep(.stk-table .stk-table-scroll-container) {
    flex: 1;
}
```

Drag the height controller below to see flexible row heights.
<demo react="basic/row-height/RowHeightFull.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/row-height/RowHeightFull.tsx"></demo>
This is useful for tables with **fixed number of rows**.

::: info
When the height is reduced to a certain extent, you can see that the minimum height is still determined by the content in the table (min-content).
:::

