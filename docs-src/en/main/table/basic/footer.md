# Footer Summary Row

* `props.footerData` Configure footer summary row data.
* `props.footerConfig` Configure footer position and behavior.

`footerData` is an array where each element represents a footer row. The data structure is similar to `dataSource`, with field names corresponding to column's dataIndex.

## Basic Usage

Pass `props.footerData` directly:
```tsx
const footerData: Data[] = [
    { name: 'Total', age: 84, salary: 26000, bonus: 7000, },
];

<StkTable
    rowKey="name"
    columns={columns}
    dataSource={dataSource}
    footerData={footerData} //[!code ++]
/>
```

<demo react="basic/footer/Footer.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/footer/Footer.tsx"></demo>

## Anchor to Top

Anchor the footer to the top of the table:

```tsx
<StkTable
    footerData={footerData}
    footerConfig={{ position: 'top' }} //[!code ++]
/>
```

<demo react="basic/footer/FooterTop.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/footer/FooterTop.tsx"></demo>

## Multi-row Header Support

The footer correctly positions itself below multi-row headers:

<demo react="basic/footer/FooterMultiHeader.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/footer/FooterMultiHeader.tsx"></demo>

## API

### FooterConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| position | `'bottom'` \| `'top'` | `'bottom'` | Footer  anchor position |

### FooterData

An array where each element represents a footer row. The data structure should match the column definitions.
