# 实验性功能

这是实验性功能，未来版本可能会发生变化

## experimental.scrollY 

基于 transform 的垂直滚动模拟。

由于DOM元素高度有上限，展示超大量数据可能会有问题。用transform模拟滚动即可解决。

### 用法

```js
<StkTable
    virtual
    scrollRowByRow
    experimental={{ scrollY: true }} //[!code ++]
    dataSource={dataSource}
    columns={columns}
/>
```

