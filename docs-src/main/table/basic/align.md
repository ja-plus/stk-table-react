# 对齐方式

配置
| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| align | `"left"`\|`"center"`\|`"right"` | 'left' | 表体对齐方式 |
| headerAlign | `"left"`\|`"center"`\|`"right"` | 'center' | 表头对齐方式 |


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
