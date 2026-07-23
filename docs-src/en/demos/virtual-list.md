# Virtual Single List

It's essentially a table with **only one column**, implemented through the following steps:
* `props.bordered=false` to remove the table border.
* `props.headless=true` to remove the table header.
* `props.rowActive=false` to remove row click highlighting.
* `props.rowHover=false` to remove row hover styles.
* `props.rowHeight` to set row height.
* `StkTableColumn['customCell']` to customize cell content.


## Code Example
```ts
<StkTable
    rowKey="id"
    style={{ height: 400 }}
    virtual // [!code ++]
    headless // [!code ++]
    rowHeight={200} // [!code ++]
    bordered={false} // [!code ++]
    rowActive={false} // [!code ++]
    rowHover={false} // [!code ++]
    columns={columns}
    dataSource={data}
/>
```
## Examples

### Equal Height
<demo react="demos/VirtualList/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/VirtualList"></demo>

### Variable Height
Configure `props.autoRowHeight` to enable automatic row height.

Set the expected height through `props.autoRowHeight.expectedHeight`. By default, `props.rowHeight` is used as the expected height.

<demo react="demos/VirtualList/AutoHeightVirtualList/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/VirtualList/AutoHeightVirtualList"></demo>
