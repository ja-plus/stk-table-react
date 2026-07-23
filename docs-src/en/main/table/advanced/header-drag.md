# Header Drag

* Configure the `headerDrag` property to enable column dragging for reordering.
* `columns` needs to be updated via the `onUpdateColumns` callback.

```js
<StkTable
    headerDrag // [!code ++]
    columns={columns}
    onUpdateColumns={newCols => setColumns(newCols)} // [!code ++]
/>
```

Try dragging the headers

<demo react="advanced/header-drag/HeaderDrag.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/header-drag/HeaderDrag.tsx"></demo>

## Change Order via Event
```ts
/**
 * Header column drag event
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
```

This way, you don't need to update via the `onUpdateColumns` callback; you can manually update the order of the `columns` array.

## API

### props.headerDrag

```ts
/** header drag config */
export type HeaderDragConfig<DT extends Record<string, any> = any> =
    | boolean
    | {
          /**
           * Column exchange mode
           * - none - Do nothing
           * - insert - Insert (default)
           * - swap - Swap
           */
          mode?: 'none' | 'insert' | 'swap';
          /** Columns to disable dragging */
          disabled?: (col: StkTableColumn<DT>) => boolean;
      };
```

### props
```ts
/**
 * Header column drag event
 * ```(dragStartKey: string, targetColKey: string)```
 */
onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
/**
 * Header column drag start
 * ```(dragStartKey: string)```
 */
onThDragStart?: (dragStartKey: string) => void;
/**
 * Header column drag drop
 * ```(targetColKey: string)```
 */
onThDrop?: (targetColKey: string) => void;
```
