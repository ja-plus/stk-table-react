# 列拖动更换顺序

* 配置 `headerDrag` 属性，可以启用列拖动更换顺序的功能。
* `columns` 需配合 `onUpdateColumns` 回调更新。

```js
<StkTable
    headerDrag // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

尝试拖动表头

<demo react="advanced/header-drag/HeaderDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/header-drag/HeaderDrag.tsx"></demo>

## 通过事件更改顺序
```ts
/**
 * 表头列拖动事件
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

这样，您可以不用通过 `onUpdateColumns` 回调更新，手动更新 `columns` 数组的顺序即可。

## API

### props.headerDrag

```ts
/** header drag config */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * 列交换模式
           * - none - 不做任何事
           * - insert - 插入(默认值)
           * - swap - 交换
           */
          mode?: 'none' | 'insert' | 'swap';
          /** 禁用拖动的列 */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### props
```ts
/**
 * 表头列拖动事件
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
/**
 * 表头列拖动开始
 * ```(dragStartKey: string)```
 */
onThDragStart?: (dragStartKey: string) => void;
/**
 * 表头列拖动drop
 * ```(targetColKey: string)```
 */
onThDrop?: (targetColKey: string) => void;
```
