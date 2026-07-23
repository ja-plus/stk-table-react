# 虚拟单列表
其实就是只有**一列**的表格，通过以下几步实现：
* `props.bordered=false` 去除表格的边框。
* `props.headless=true` 去除表头。
* `props.rowActive=false` 去除行点击高亮。
* `props.rowHover=false` 去除行hover样式。
* `props.rowHeight` 设置行高。
* `StkTableColumn['customCell']` 自定义单元格内容。


## 代码示意
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
## 例子

### 等高
<demo react="demos/VirtualList/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/VirtualList"></demo>

### 不等高
配置 `props.autoRowHeight`即可打开自动行高。

通过`props.autoRowHeight.expectedHeight`设置期望行高。默认使用 `props.rowHeight` 作为期望行高

<demo react="demos/VirtualList/AutoHeightVirtualList/index.tsx"  github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/demos/VirtualList/AutoHeightVirtualList"></demo>
