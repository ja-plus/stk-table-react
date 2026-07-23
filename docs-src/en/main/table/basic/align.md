# Alignment

Configuration
| Property | Type | Default | Description |
| --- | --- | --- | --- |
| align | `"left"`\|`"center"`\|`"right"` | 'left' | Table body alignment |
| headerAlign | `"left"`\|`"center"`\|`"right"` | 'center' | Table header alignment |

```ts
const columns:StkTableColumn<any>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    align: 'center', // [!code ++]
    headerAlign: 'center', // [!code ++]
  },
]
```

<demo react="basic/align/Align.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/align/Align.tsx"></demo>
