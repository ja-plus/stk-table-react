# Filter <Badge type="warning" text="Beta" />

Filter is a built-in column header filter component. Click the filter icon in the column header to open the filter panel. It supports manually specified options and automatically extracting options from data.

### Basic Usage

Create a Filter component via the `createFilterCell` factory function and use it as `customHeaderCell`.

<demo react="advanced/custom-cells/FilterCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/FilterCell/index.tsx"></demo>

### Auto Extract Options

Set `autoOptions: true`, and Filter will automatically extract unique values from the current column's data as filter options.

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // Automatically extract options from data
    }),
}
```

::: tip Limitations
* `autoOptions` is convenient for small datasets. For **large datasets**, a full traversal may cause performance issues.
* Option order is not guaranteed.
:::

### Custom Filter Logic

You can customize the filter logic via the `filter` parameter:

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: 'Under 30', value: 'young' },
            { label: '30 and above', value: 'old' },
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

### createFilterCell Options

The `createFilterCell` factory function accepts a configuration object:

```ts
interface CreateFilterCellOption {
    /** Whether to use remote filtering, default false */
    remote?: boolean;
    /** Triggered when filter status changes */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| Property | Type | Default | Description |
|---|---|---|---|
| remote | `boolean` | `false` | Whether to use remote filtering, when set to true, automatic data filtering will not be triggered |
| onChange | `(data) => void` | - | Callback when filter status changes, parameters include `colKey` (column key) and `status` (current column filter status) |

### Configuration Options

`FilterComponent` accepts a configuration object:

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // Filter options list
    filter?: (args) => boolean;     // Custom filter function
    autoOptions?: boolean;          // Whether to automatically extract options from data, default false
}

interface FilterOption {
    label: string;     // Display text
    value: any;        // Filter value
    selected?: boolean; // Whether selected by default
}
```

### FilterStatus Type

```ts
interface FilterStatus {
    /** Currently selected filter values array */
    value: any[];
    /** Custom filter logic function */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```
