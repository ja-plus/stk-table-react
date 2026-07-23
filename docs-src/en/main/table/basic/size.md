# Table Size

The width and height of the table are determined by the width and height of the root container.

Therefore, you can place the table in a `flex` container and let `flex` manage the height instead of manually setting the width and height.

## Fixed Width and Height

::: tip
Control the table width and height through `style`.
:::     

<demo react="basic/size/Default.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/size/Default.tsx"></demo>

## Flex Layout

::: tip
Control the height of the outer `flex` container, and the table height will adapt.
:::

<demo react="basic/size/Flex.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/basic/size/Flex.tsx"></demo>
