# Bordered
Configure `bordered` to implement table borders, with values `true` | `false` | `h` | `v` | `body-v`.

| Value | Description |
| --- | --- |
| `true` | All table borders |
| `false` | No border |
| `h` | Only horizontal lines |
| `v` | Only vertical lines |
| `body-v` | Header and body with horizontal lines, body with vertical lines |
| `body-h` | Header and body with vertical lines, body with horizontal lines |

::: tip
Due to scrollbar influence, the right and bottom borders of the table are implemented by cell's `border-right` and `border-bottom`, which may disappear. You can add custom CSS as needed.
:::
<demo react="basic/border/Default.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/border/Default.tsx"></demo>