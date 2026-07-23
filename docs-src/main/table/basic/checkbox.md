# 多选框
## 使用内置扩展 <Badge type="tip" text="^1.0.0" />
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 自行实现

通过 `customCell` 和 `customHeaderCell` 配置项来自定义实现多选框功能。这种方式非常灵活，可以满足不同的业务需求。
## 示例

<demo react="basic/checkbox/Checkbox.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/checkbox/Checkbox.tsx"></demo>

## 代码实现

在 columns 配置中添加一个自定义列，用于显示复选框：

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
input元素外面加一层父元素，为了垂直居中。

您可以根据项目中使用的React组件库(Ant Design, Material UI, Chakra UI,等)中的`Checkbox`组件来替代`input`实现多选框, 以保持项目整体样式统一。
