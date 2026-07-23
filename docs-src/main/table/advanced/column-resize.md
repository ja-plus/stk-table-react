# 列宽调整

## 配置
* `props.colResizable` 即可打开列宽调整。
* `props.columns` 需配合 `onUpdateColumns` 回调更新，列宽修改后会直接变更 `StkTableColumn['width']` 的值。
* `columns` 需要用 `useState` 存储，以支持响应式更新。

```js
<StkTable
    colResizable // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

::: warning
打开列宽调整后，列宽不会默认铺满容器 。
:::

<demo react="advanced/column-resize/ColResizable.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/column-resize/ColResizable.tsx"></demo>


## 通过事件更改列宽
```ts
/**
 * 列宽变动时触发
 *
 *  ```(col: StkTableColumn<DT>)```
 */
onColResize?: (col: StkTableColumn<DT>) => void;
```

这样，您可以不用通过 `onUpdateColumns` 回调更新，手动更新 `StkTableColumn['width']` 的值即可。

## 列宽铺满容器hack方式
如果您希望列宽铺满容器，可以通过css设置 `.stk-table-main` 为 `flex: 1`，这样表格将铺满容器。

然后把某一列 `width` 替换为 `minWidth`，这样这一列就会自动占满剩余宽度，其他列依然是设置的宽度 。

通过 `props.colResizable.disabled`禁用最后一列的拖动列宽调整。

下面的 demo 设置了最后一列的 minWidth。
<demo react="advanced/column-resize/ColResizableFullHack.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/column-resize/ColResizableFullHack.tsx"></demo>


## API
### props.colResizable:
| type | 说明 |
| --- | --- | 
| boolean | 是否开启列宽调整  |
| ColResizableConfig | 配置 |

### ColResizableConfig
| 属性 | 类型 | 默认值| 说明 |
| --- | --- | ---- | --- |
| disabled | `(col:StkTableColumn) => boolean` | -- | 是否开启列宽调整 |


