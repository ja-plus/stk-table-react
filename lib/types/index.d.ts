import { default as React, ComponentType, ReactNode } from 'react';

/** 排序方式，asc-正序，desc-倒序，null-默认顺序 */
export type Order = null | 'asc' | 'desc';
type Sorter<T> = boolean | ((data: T[], option: {
    order: Order;
    column: any;
}) => T[]);
export type CustomCellProps<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    /** row[col.dataIndex] 的值 */
    cellValue: any;
    rowIndex: number;
    colIndex: number;
    /**
     * 当前行是否展开
     */
    expanded?: PrivateRowDT['__EXP__'];
    /** if tree expanded */
    treeExpanded?: PrivateRowDT['__T_EXP__'];
};
export type CustomHeaderCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    rowIndex: number;
    colIndex: number;
};
export type CustomFooterCellProps<T extends Record<string, any>> = {
    col: StkTableColumn<T>;
    row: T;
    cellValue: any;
    rowIndex: number;
    colIndex: number;
};
export type MergeCellsParam<T extends Record<string, any>> = {
    row: T;
    col: StkTableColumn<T>;
    rowIndex: number;
    colIndex: number;
};
export type MergeCellsFn<T extends Record<string, any>> = (data: MergeCellsParam<T>) => {
    rowspan?: number;
    colspan?: number;
} | undefined;
/** React custom cell component type */
export type CustomCell<T extends CustomCellProps<U> | CustomHeaderCellProps<U>, U extends Record<string, any>> = ComponentType<Partial<T>>;
/** 表格列配置 */
export type StkTableColumn<T extends Record<string, any>> = {
    key?: any;
    type?: 'seq' | 'expand' | 'dragRow' | 'tree-node';
    dataIndex: keyof T & string;
    title?: string;
    align?: 'right' | 'left' | 'center';
    headerAlign?: 'right' | 'left' | 'center';
    sorter?: Sorter<T>;
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    headerClassName?: string;
    className?: string;
    sortField?: keyof T;
    sortType?: 'number' | 'string';
    sortConfig?: Omit<SortConfig<T>, 'defaultSort'>;
    fixed?: 'left' | 'right' | null;
    hidden?: boolean;
    customCell?: CustomCell<CustomCellProps<T>, T>;
    customHeaderCell?: CustomCell<CustomHeaderCellProps<T>, T>;
    customFooterCell?: CustomCell<CustomFooterCellProps<T>, T>;
    children?: StkTableColumn<T>[];
    mergeCells?: MergeCellsFn<T>;
};
/** private StkTableColumn type */
export type PrivateStkTableColumn<T extends Record<string, any>> = StkTableColumn<T> & {
    __R_SP__?: number;
    __C_SP__?: number;
    __P__?: StkTableColumn<T> | null;
    __W__?: number;
    __LF_S__?: number;
    __LF_E__?: number;
    __VT_C_SP__?: number;
};
/** private row keys */
export type PrivateRowDT = {
    __R_K__?: string;
    __EXP__?: StkTableColumn<any>;
    __T_EXP__?: boolean;
    __T_P_K__?: UniqKey;
    __T_LV__?: number;
    __EXP_R__?: any;
    __EXP_C__?: StkTableColumn<any>;
    children?: any[];
};
export type SortOption<T extends Record<string, any>> = Pick<StkTableColumn<T>, 'sorter' | 'dataIndex' | 'sortField' | 'sortType'>;
export type SortState<T extends Record<string, any>> = Pick<StkTableColumn<T>, 'key' | 'dataIndex' | 'sortField' | 'sortType'> & {
    order: Order;
};
export type UniqKey = string | number;
export type UniqKeyFun = (param: any) => UniqKey;
export type UniqKeyProp = UniqKey | UniqKeyFun;
export type DefaultSortConfig<T extends Record<string, any>> = {
    key?: StkTableColumn<T>['key'];
    dataIndex: StkTableColumn<T>['dataIndex'];
    order: Order;
    sortField?: StkTableColumn<T>['sortField'];
    sortType?: StkTableColumn<T>['sortType'];
    sorter?: StkTableColumn<T>['sorter'];
    silent?: boolean;
};
export type SortConfig<T extends Record<string, any>> = {
    defaultSort?: DefaultSortConfig<T>;
    emptyToBottom?: boolean;
    stringLocaleCompare?: boolean;
    sortChildren?: boolean;
    multiSort?: boolean;
    multiSortLimit?: number;
};
/** th td type */
export declare const TagType: {
    readonly TH: 0;
    readonly TD: 1;
    readonly TF: 2;
};
export type TagType = (typeof TagType)[keyof typeof TagType];
export type HighlightConfig = {
    duration?: number;
    fps?: number;
};
export type SeqConfig = {
    startIndex?: number;
};
export type ExpandConfig = {
    height?: number;
};
export type DragRowConfig = {
    mode?: 'none' | 'insert' | 'swap';
};
export type TreeConfig = {
    defaultExpandAll?: boolean;
    defaultExpandKeys?: UniqKey[];
    defaultExpandLevel?: number;
};
export type HeaderDragConfig<DT extends Record<string, any> = any> = {
    mode?: 'none' | 'insert' | 'swap';
    disabled?: (col: StkTableColumn<DT>) => boolean;
};
export type AutoRowHeightConfig<DT> = {
    expectedHeight?: number | ((row: DT) => number);
};
export type ColResizableConfig<DT extends Record<string, any>> = {
    disabled: (col: StkTableColumn<DT>) => boolean;
};
export type RowKeyGen = (row: any) => UniqKey;
export type ColKeyGenFn = (col: StkTableColumn<any>) => UniqKey;
export type CellKeyGen = (row: any, col: StkTableColumn<any>) => string;
export type RowActiveOption<DT> = {
    enabled?: boolean;
    disabled?: (row: DT) => boolean;
    revokable?: boolean;
};
export type AreaSelectionRange = {
    index: {
        x: [number, number];
        y: [number, number];
        begin: {
            row: number;
            col: number;
        };
        end: {
            row: number;
            col: number;
        };
    };
};
export type AreaSelectionConfig<T extends Record<string, any> = any> = {
    enabled?: boolean;
    formatCellForClipboard?: (row: T, col: StkTableColumn<T>, rawValue: any) => string;
    keyboard?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    highlight?: {
        cell?: boolean;
        row?: boolean;
    };
};
export type AreaSelectionSetterRange<DT extends Record<string, any>> = {
    begin: {
        row: number | DT;
        col?: number | StkTableColumn<DT>;
    };
    end?: {
        row: number | DT;
        col?: number | StkTableColumn<DT>;
    };
};
export type AreaSelectionSetterOption = {
    silent?: boolean;
    scrollToView?: boolean;
};
export type ExperimentalConfig = {
    scrollY?: boolean;
};
export type FooterConfig = {
    position?: 'bottom' | 'top';
};
/** StkTable React Props */
export type StkTableProps<DT extends Record<string, any> = any> = {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    stripe?: boolean;
    fixedMode?: boolean;
    headless?: boolean;
    theme?: 'light' | 'dark';
    rowHeight?: number;
    autoRowHeight?: boolean | AutoRowHeightConfig<DT>;
    rowHover?: boolean;
    rowActive?: boolean | RowActiveOption<DT>;
    rowCurrentRevokable?: boolean;
    headerRowHeight?: number | string;
    footerRowHeight?: number | string;
    virtual?: boolean;
    virtualX?: boolean;
    columns?: StkTableColumn<DT>[];
    dataSource?: DT[];
    rowKey?: UniqKeyProp;
    colKey?: UniqKeyProp;
    emptyCellText?: string | ((option: {
        row: DT;
        col: StkTableColumn<DT>;
    }) => string);
    noDataFull?: boolean;
    showNoData?: boolean;
    sortRemote?: boolean;
    showHeaderOverflow?: boolean;
    showOverflow?: boolean;
    showTrHoverClass?: boolean;
    cellHover?: boolean;
    cellActive?: boolean;
    selectedCellRevokable?: boolean;
    areaSelection?: boolean | AreaSelectionConfig;
    headerDrag?: boolean | HeaderDragConfig<DT>;
    rowClassName?: (row: DT, i: number) => string | undefined;
    colResizable?: boolean | ColResizableConfig<DT>;
    colMinWidth?: number;
    bordered?: boolean | 'h' | 'v' | 'body-v' | 'body-h';
    autoResize?: boolean | (() => void);
    fixedColShadow?: boolean;
    sortConfig?: SortConfig<DT>;
    hideHeaderTitle?: boolean | string[];
    highlightConfig?: HighlightConfig;
    seqConfig?: SeqConfig;
    expandConfig?: ExpandConfig;
    dragRowConfig?: DragRowConfig;
    treeConfig?: TreeConfig;
    cellFixedMode?: 'sticky' | 'relative';
    smoothScroll?: boolean;
    scrollRowByRow?: boolean | 'scrollbar';
    scrollbar?: boolean | ScrollbarOptions;
    experimental?: ExperimentalConfig;
    footerData?: DT[];
    footerConfig?: FooterConfig;
    /** React slots */
    renderHeader?: (col: StkTableColumn<DT>) => ReactNode;
    renderEmpty?: () => ReactNode;
    renderExpand?: (row: any, col: StkTableColumn<DT>) => ReactNode;
    renderCustomBottom?: () => ReactNode;
    /** Events */
    onSortChange?: (col: StkTableColumn<DT> | null, order: Order, data: DT[], sortConfig: SortConfig<DT>) => void;
    onRowClick?: (ev: React.MouseEvent, row: DT, data: {
        rowIndex: number;
    }) => void;
    onCurrentChange?: (ev: React.MouseEvent | null, row: DT | undefined, data: {
        select: boolean;
    }) => void;
    onCellSelected?: (ev: React.MouseEvent | null, data: {
        select: boolean;
        row: DT | undefined;
        col: StkTableColumn<DT> | undefined;
    }) => void;
    onRowDblclick?: (ev: React.MouseEvent, row: DT, data: {
        rowIndex: number;
    }) => void;
    onHeaderRowMenu?: (ev: React.MouseEvent) => void;
    onRowMenu?: (ev: React.MouseEvent, row: DT, data: {
        rowIndex: number;
    }) => void;
    onCellClick?: (ev: React.MouseEvent, row: DT, col: StkTableColumn<DT>, data: {
        rowIndex: number;
    }) => void;
    onCellMouseenter?: (ev: React.MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
    onCellMouseleave?: (ev: React.MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
    onCellMouseover?: (ev: React.MouseEvent, row: DT, col: StkTableColumn<DT>) => void;
    onCellMousedown?: (ev: React.MouseEvent, row: DT, col: StkTableColumn<DT>, data: {
        rowIndex: number;
    }) => void;
    onHeaderCellClick?: (ev: React.MouseEvent, col: StkTableColumn<DT>) => void;
    onScroll?: (ev: Event, data: {
        startIndex: number;
        endIndex: number;
    }) => void;
    onScrollX?: (ev: Event) => void;
    onColOrderChange?: (dragStartKey: string, targetColKey: string) => void;
    onThDragStart?: (dragStartKey: string) => void;
    onThDrop?: (targetColKey: string) => void;
    onRowOrderChange?: (dragStartKey: string, targetRowKey: string) => void;
    onColResize?: (col: StkTableColumn<DT>) => void;
    onToggleRowExpand?: (data: {
        expanded: boolean;
        row: DT;
        col: StkTableColumn<DT> | null;
    }) => void;
    onToggleTreeExpand?: (data: {
        expanded: boolean;
        row: DT;
        col: StkTableColumn<DT> | null;
    }) => void;
    onAreaSelectionChange?: (ranges: AreaSelectionRange[]) => void;
    onFilterChange?: (status: Record<UniqKey, any>) => void;
    onUpdateColumns?: (cols: StkTableColumn<DT>[]) => void;
    className?: string;
    style?: React.CSSProperties;
};
/** StkTable ref handle */
export type StkTableRef<DT extends Record<string, any> = any> = {
    initVirtualScroll: () => void;
    initVirtualScrollX: () => void;
    initVirtualScrollY: () => void;
    setCurrentRow: (rowKeyOrRow: string | undefined | DT, option?: {
        silent?: boolean;
        deep?: boolean;
    }) => void;
    setSelectedCell: (row?: DT, col?: StkTableColumn<DT>, option?: {
        silent?: boolean;
    }) => void;
    setHighlightDimCell: (rowKeyValue: UniqKey, colKeyValue: string, option?: any) => void;
    setHighlightDimRow: (rowKeyValues: UniqKey[], option?: any) => void;
    sortCol: () => keyof DT | undefined;
    sortStates: () => SortState<DT>[];
    getSortColumns: () => {
        key: keyof DT | undefined;
        order: Order;
    }[];
    setSorter: (colKey: string, order: Order, option?: any) => DT[];
    resetSorter: () => void;
    scrollTo: (top?: number | null, left?: number | null) => void;
    getTableData: () => DT[];
    getRowIndex: (row: DT) => number;
    getColumnIndex: (column: any) => number;
    setRowExpand: (rowKeyOrRow: string | undefined | DT, expand?: boolean | null, data?: any) => void;
    setAutoHeight: (rowKey: UniqKey, height?: number | null) => void;
    clearAllAutoHeight: () => void;
    setTreeExpand: (row: any, option?: {
        expand?: boolean;
    }) => void;
    getSelectedArea: () => any;
    setAreaSelection: (range: any, option?: any) => void;
    clearSelectedArea: () => void;
    copySelectedArea: () => string;
    setFilter: (status: any, option?: any) => void;
};
export type ScrollbarOptions = {
    enabled?: boolean;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
};
export {};
