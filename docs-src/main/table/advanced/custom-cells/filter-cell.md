# Filter 筛选 <Badge type="tip" text="^1.0.0" /> <Badge type="warning" text="Beta" />

Filter 是一个内置的列头筛选组件，点击列头筛选图标即可弹出筛选面板，支持手动指定选项和自动从数据提取选项。

### 基础使用

通过 `createFilterCell` 工厂函数创建 Filter 组件，并将其作为 `customHeaderCell` 使用。

<demo react="advanced/custom-cells/FilterCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/FilterCell/index.tsx"></demo>

### 自动提取选项

设置 `autoOptions: true`，Filter 会自动从当前列的数据中提取去重后的值作为筛选选项。

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // 自动从数据提取选项
    }),
}
```

::: tip 局限性
* `autoOption` 作为少量数据下方便开发使用。对于**大量数据**，要全量遍历，可能会有性能问题。
* option 顺序不固定。
:::

### 自定义筛选逻辑

通过 `filter` 参数可以自定义筛选逻辑：

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: '30岁以下', value: 'young' },
            { label: '30岁以上', value: 'old' },
        ],
        filter: ({ row, cellValue, filterValues }) => {
            return filterValues.some(v => {
                if (v === 'young') return cellValue < 30;
                if (v === 'old') return cellValue >= 30;
                return false;
            });
        },
    }),
}
```

<demo react="advanced/custom-cells/FilterCell/CustomFilter.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/FilterCell/CustomFilter.tsx"></demo>

### createFilterCell 选项

`createFilterCell` 工厂函数接受一个配置对象：

```ts
interface CreateFilterCellOption {
    /** 是否远程筛选，默认 false */
    remote?: boolean;
    /** 筛选状态改变时触发 */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| remote | `boolean` | `false` | 是否远程筛选，设置为 true 时不会自动触发数据过滤 |
| onChange | `(data) => void` | - | 筛选状态改变时的回调，参数包含 `colKey`（列键）和 `status`（当前列筛选状态） |

### 配置选项

`FilterComponent` 接受一个配置对象：

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // 筛选选项列表
    filter?: (args) => boolean;     // 自定义筛选函数
    autoOptions?: boolean;          // 是否自动从数据提取选项，默认 false
}

interface FilterOption {
    label: string;     // 显示文本
    value: any;        // 筛选值
    selected?: boolean; // 是否默认选中
}
```

### FilterStatus 类型

```ts
interface FilterStatus {
    /** 当前选中的筛选值数组 */
    value: any[];
    /** 自定义筛选逻辑函数 */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```
