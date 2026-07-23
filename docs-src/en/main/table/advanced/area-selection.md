# Area Selection <Badge type="warning" text="Need Register" /> 
Enable table cell drag selection through `props.areaSelection`.
- Support copying to clipboard (Ctrl/Cmd + C).
- Esc to cancel selection
- Support keyboard selection (arrow keys, Shift, Tab).
- Support Ctrl multi-selection (configurable)
- Support Shift extend selection (configurable)

::: tip Need Registration 
This feature needs to be registered before use.
:::
Registration method:
```ts
import { registerFeature, useAreaSelection } from 'stk-table-react';
// Register area selection feature
registerFeature(useAreaSelection);
```



```js
<StkTable
    area-selection // [!code ++]
></StkTable>
```

<demo react="advanced/area-selection/AreaSelection.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/area-selection/AreaSelection.tsx"></demo>

## Props
- [`areaSelection`](/en/main/api/table-props.md#areaselection)

## Emit
- [area-selection-change Triggered when area changes](/en/main/api/emits.html#area-selection-change) 

## Exposed
- [getSelectedArea](/en/main/api/expose.md#getselectedarea)
- [setAreaSelection](/en/main/api/expose.md#setareaselection)
- [clearSelectedArea](/en/main/api/expose.md#clearselectedarea)
- [copySelectedArea](/en/main/api/expose.md#copyselectedarea)
