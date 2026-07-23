import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { DragHandle, SortIcon, TreeNodeCell, TriangleIcon } from './components';
import {
    CELL_KEY_SEPARATE,
    DEFAULT_ROW_ACTIVE_CONFIG,
    DEFAULT_ROW_HEIGHT,
    DEFAULT_SMOOTH_SCROLL,
    DEFAULT_SORT_CONFIG,
    IS_LEGACY_MODE,
} from './const';
import {
    AreaSelectionConfig,
    AreaSelectionRange,
    AreaSelectionSetterOption,
    AreaSelectionSetterRange,
    AutoRowHeightConfig,
    Order,
    PrivateRowDT,
    PrivateStkTableColumn,
    RowActiveOption,
    SortConfig,
    SortState,
    StkTableColumn,
    StkTableProps,
    StkTableRef,
    TagType,
    UniqKey,
} from './types';
import { getCalculatedColWidth, createStkTableId } from './utils/constRefUtils';
import {
    binarySearch,
    getClosestColKey,
    getClosestTd,
    getClosestTr,
    getClosestTrIndex,
    pureCellKeyGen,
    tableSort,
    throttle,
    transformWidthToStr,
} from './utils';
import { useTableColumns } from './hooks/useTableColumns';
import { useHighlight } from './hooks/useHighlight';
import { StkTableContext } from './context';
import type { StkTableContextType } from './context';

type DT = any & PrivateRowDT;

const SORT_SWITCH_ORDER: Order[] = [null, 'desc', 'asc'];

/** 检测主要指针是否为触摸设备（移动/平板） */
function isTouchPrimaryDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

// ---- 区域选取常量与工具 ----
/** 自动滚动：鼠标距容器边缘多少px开始触发 */
const EDGE_ZONE = 40;
/** 自动滚动：每帧最大滚动像素 */
const SCROLL_SPEED_MAX = 15;
const POINT_EDGE_OFFSET = 2;

const KEY_ARROW_UP = 'ArrowUp';
const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const KEY_TAB = 'Tab';
const KEY_ESCAPE = 'Escape';
const KEY_ESC = 'Esc';
const KEY_C = 'c';

// 区域选取 CSS 类名
const CELL_RANGE_SELECTED = 'cell-range-selected';
const CELL_RANGE_TOP = 'cell-range-t';
const CELL_RANGE_BOTTOM = 'cell-range-b';
const CELL_RANGE_LEFT = 'cell-range-l';
const CELL_RANGE_RIGHT = 'cell-range-r';
const ROW_RANGE_SELECTED = 'row-range-selected';

/** 空集合常量，避免重复创建 */
const EMPTY_CELL_KEY_SET: Set<string> = new Set();

/** 钳制值到指定范围内 */
function clampNum(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

/** 获取归一化（min/max）后的选区范围 */
function normalizeRange(range: AreaSelectionRange) {
    const { begin, end } = range.index;
    return {
        minRow: Math.min(begin.row, end.row),
        maxRow: Math.max(begin.row, end.row),
        minCol: Math.min(begin.col, end.col),
        maxCol: Math.max(begin.col, end.col),
    };
}

/** 构造选区范围。begin = 拖拽起点，end = 拖拽终点 */
function makeRange(beginRow: number, beginCol: number, endRow: number, endCol: number): AreaSelectionRange {
    return {
        index: {
            x: [beginCol, endCol],
            y: [beginRow, endRow],
            begin: { row: beginRow, col: beginCol },
            end: { row: endRow, col: endCol },
        },
    };
}

/** 计算自动滚动的增量 */
function calculateAutoScrollDelta(mouseX: number, mouseY: number, rect: DOMRect): { deltaX: number; deltaY: number } {
    const { top, bottom, left, right } = rect;
    let deltaX = 0;
    let deltaY = 0;

    // Y方向
    if (mouseY < top + EDGE_ZONE) {
        const dist = Math.max(0, top + EDGE_ZONE - mouseY);
        deltaY = -Math.ceil((dist / EDGE_ZONE) * SCROLL_SPEED_MAX);
    } else if (mouseY > bottom - EDGE_ZONE) {
        const dist = Math.max(0, mouseY - (bottom - EDGE_ZONE));
        deltaY = Math.ceil((dist / EDGE_ZONE) * SCROLL_SPEED_MAX);
    }

    // X方向
    if (mouseX < left + EDGE_ZONE) {
        const dist = Math.max(0, left + EDGE_ZONE - mouseX);
        deltaX = -Math.ceil((dist / EDGE_ZONE) * SCROLL_SPEED_MAX);
    } else if (mouseX > right - EDGE_ZONE) {
        const dist = Math.max(0, mouseX - (right - EDGE_ZONE));
        deltaX = Math.ceil((dist / EDGE_ZONE) * SCROLL_SPEED_MAX);
    }

    return { deltaX, deltaY };
}

/** 根据按键计算移动方向 */
function getMovementDelta(key: string, shiftKey: boolean): [number, number] {
    let rowDelta = 0;
    let colDelta = 0;

    switch (key) {
        case KEY_ARROW_UP:
            rowDelta = -1;
            break;
        case KEY_ARROW_DOWN:
            rowDelta = 1;
            break;
        case KEY_ARROW_LEFT:
            colDelta = -1;
            break;
        case KEY_ARROW_RIGHT:
            colDelta = 1;
            break;
        case KEY_TAB:
            // Tab: right; Shift+Tab: left
            colDelta = shiftKey ? -1 : 1;
            break;
    }

    return [rowDelta, colDelta];
}

/** 处理Tab键的换行逻辑 */
function handleTabWrap(row: number, col: number, rawCol: number, rowCount: number, colCount: number): [number, number] {
    if (rawCol >= colCount) return [Math.min(row + 1, rowCount - 1), 0];
    if (rawCol < 0) return [Math.max(row - 1, 0), colCount - 1];
    return [row, col];
}

/**
 * StkTable React Component
 * A high-performance virtual scrolling table
 */
export const StkTable = forwardRef<StkTableRef<DT>, StkTableProps<DT>>((props, ref) => {
    const {
        width = '',
        minWidth = '',
        maxWidth = '',
        stripe = false,
        fixedMode = false,
        headless = false,
        theme = 'light',
        rowHeight = DEFAULT_ROW_HEIGHT,
        autoRowHeight = false,
        rowHover = true,
        rowActive = DEFAULT_ROW_ACTIVE_CONFIG,
        rowCurrentRevokable = true,
        headerRowHeight = DEFAULT_ROW_HEIGHT,
        footerRowHeight = DEFAULT_ROW_HEIGHT,
        virtual = false,
        virtualX = false,
        columns = [],
        dataSource = [],
        rowKey = '',
        colKey,
        emptyCellText = '--',
        noDataFull = false,
        showNoData = true,
        sortRemote = false,
        showHeaderOverflow = false,
        showOverflow = false,
        showTrHoverClass = false,
        cellHover = false,
        cellActive = false,
        selectedCellRevokable = true,
        areaSelection = false,
        headerDrag = false,
        rowClassName = () => '',
        colResizable = false,
        colMinWidth = 10,
        bordered = true,
        autoResize = true,
        fixedColShadow = false,
        sortConfig = DEFAULT_SORT_CONFIG,
        hideHeaderTitle = false,
        highlightConfig = {},
        seqConfig = {},
        expandConfig = {},
        dragRowConfig = {},
        treeConfig = {},
        cellFixedMode = 'sticky',
        smoothScroll = DEFAULT_SMOOTH_SCROLL,
        scrollRowByRow = false,
        scrollbar = false,
        experimental = {},
        footerData = [],
        footerConfig = { position: 'bottom' },
        renderHeader,
        renderEmpty,
        renderExpand,
        renderCustomBottom,
        onSortChange,
        onRowClick,
        onCurrentChange,
        onCellSelected,
        onRowDblclick,
        onHeaderRowMenu,
        onRowMenu,
        onCellClick,
        onCellMouseenter,
        onCellMouseleave,
        onCellMouseover,
        onCellMousedown,
        onHeaderCellClick,
        onScroll,
        onScrollX,
        onColOrderChange,
        onThDragStart: onThDragStartCb,
        onThDrop: onThDropCb,
        onRowOrderChange,
        onColResize,
        onToggleRowExpand,
        onToggleTreeExpand,
        onAreaSelectionChange,
        onFilterChange,
        onUpdateColumns,
        className = '',
        style,
    } = props;

    const stkTableId = useMemo(() => createStkTableId(), []);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const colResizeIndicatorRef = useRef<HTMLDivElement>(null);
    const trRefsMap = useRef<Map<string, HTMLTableRowElement>>(new Map());

    const isRelativeMode = IS_LEGACY_MODE ? true : cellFixedMode === 'relative';

    // State
    const [dataSourceCopy, setDataSourceCopy] = useState<DT[]>([]);
    const [currentRowKey, setCurrentRowKey] = useState<UniqKey | undefined>();
    const [currentSelectedCellKey, setCurrentSelectedCellKey] = useState<string | undefined>();
    const [currentHoverRowKey, setCurrentHoverRowKey] = useState<UniqKey | null>(null);
    const [sortStates, setSortStates] = useState<SortState<DT>[]>([]);
    const [isColResizing, setIsColResizing] = useState(false);
    const [version, setVersion] = useState(0); // force re-render
    // 自定义滚动条状态
    const [sbThumb, setSbThumb] = useState({ h: 0, w: 0, t: 0, l: 0 });
    const [showScrollbar, setShowScrollbar] = useState({ x: false, y: false });
    // scroll-row-by-row 拖动滚动状态
    const [isDragScroll, setIsDragScroll] = useState(false);

    // Refs for mutable state that shouldn't trigger re-render
    const virtualScrollRef = useRef({
        containerHeight: 0,
        rowHeight,
        pageSize: 0,
        startIndex: 0,
        endIndex: 0,
        offsetTop: 0,
        scrollTop: 0,
        scrollHeight: 0,
        translateY: 0,
    });
    const virtualScrollXRef = useRef({
        containerWidth: 0,
        scrollWidth: 0,
        startIndex: 0,
        endIndex: 0,
        offsetLeft: 0,
        scrollLeft: 0,
    });
    const currentRowRef = useRef<DT | undefined>(undefined);
    const currentHoverRowRef = useRef<DT | null>(null);
    const filterStatusRef = useRef<Record<UniqKey, any>>({});
    const rowKeyGenCacheRef = useRef(new WeakMap());
    const autoRowHeightMapRef = useRef(new Map<string, number>());
    const maxRowSpanRef = useRef(new Map<UniqKey, number>());
    /** 横向虚拟滚动列宽缓存，避免每次滚动都 O(n) 构建 */
    const colWidthCacheRef = useRef<{
        cols: PrivateStkTableColumn<DT>[] | null;
        nonFixedCols: { index: number; cumWidth: number }[];
        leftFixedCols: { index: number; width: number }[];
    }>({ cols: null, nonFixedCols: [], leftFixedCols: [] });
    const isWheelingRef = useRef(false);
    const wheelingTimerRef = useRef(0);
    const scrollRAFScheduledRef = useRef(false);
    /** 自定义滚动条拖动状态 */
    const sbDragRef = useRef({ isVertical: false, isHorizontal: false, startY: 0, startX: 0, startTop: 0, startLeft: 0 });
    const sbDragHandlerRef = useRef<((e: MouseEvent | TouchEvent) => void) | undefined>(undefined);
    const isMobileDeviceRef = useRef(false);
    /** scroll-row-by-row 拖动结束 debounce 定时器 */
    const srbrDebounceRef = useRef(0);

    // Column processing
    const { tableHeadersRef, tableHeadersForCalcRef, dealColumns } = useTableColumns<DT>(isRelativeMode);

    // Scrollbar options
    const scrollbarOptions = useMemo(
        () => ({
            enabled: true,
            minHeight: 20,
            minWidth: 20,
            width: 8,
            height: 8,
            ...(typeof scrollbar === 'boolean' ? { enabled: scrollbar } : scrollbar),
        }),
        [scrollbar],
    );

    const isExperimentalScrollY = useMemo(() => {
        if (scrollbarOptions?.enabled && scrollRowByRow) return true;
        return experimental?.scrollY;
    }, [scrollbarOptions, scrollRowByRow, experimental]);

    const isFooterTop = footerConfig?.position === 'top';

    // Row active config
    const rowActiveProp = useMemo<Required<RowActiveOption<DT>>>(() => {
        if (typeof rowActive === 'boolean') {
            return { ...DEFAULT_ROW_ACTIVE_CONFIG, enabled: rowActive ?? true, revokable: Boolean(rowCurrentRevokable) };
        }
        return { ...DEFAULT_ROW_ACTIVE_CONFIG, ...rowActive };
    }, [rowActive, rowCurrentRevokable]);

    // Key generators
    const rowKeyGenComputed = useMemo(() => {
        if (typeof rowKey === 'function') {
            return (row: DT) => (rowKey as (row: DT) => string)(row);
        }
        return (row: DT) => row[rowKey];
    }, [rowKey]);

    const colKeyGen = useMemo<(col: StkTableColumn<DT>) => string>(() => {
        if (colKey === void 0) {
            return col => col.key || col.dataIndex;
        } else if (typeof colKey === 'function') {
            return col => (colKey as (col: StkTableColumn<DT>) => string)(col);
        }
        return col => (col as any)[colKey];
    }, [colKey]);

    const getEmptyCellTextFn = useMemo(() => {
        if (typeof emptyCellText === 'string') {
            return () => emptyCellText;
        }
        return (col: StkTableColumn<DT>, row: DT) => emptyCellText({ row, col });
    }, [emptyCellText]);

    // Row key generation with cache
    const rowKeyGen = useCallback(
        (row: DT | null | undefined) => {
            if (!row) return row;
            const cache = rowKeyGenCacheRef.current;
            let key = cache.get(row);
            if (key !== undefined) return key;
            const cachedRowKey = (row as PrivateRowDT).__R_K__;
            if (cachedRowKey !== undefined) {
                cache.set(row, cachedRowKey);
                return cachedRowKey;
            }
            key = rowKeyGenComputed(row);
            if (key === void 0) {
                key = Math.random().toString(36).slice(2);
            }
            cache.set(row, key);
            return key;
        },
        [rowKeyGenComputed],
    );

    const cellKeyGen = useCallback(
        (row: DT | null | undefined, col: StkTableColumn<DT>) => {
            return rowKeyGen(row) + CELL_KEY_SEPARATE + colKeyGen(col);
        },
        [rowKeyGen, colKeyGen],
    );

    // Table header last row
    const tableHeaderLast = useMemo(() => {
        const headers = tableHeadersForCalcRef.current;
        return headers.slice(-1)[0] || [];
    }, [version]);

    /**
     * 从 ref 读取最新的末级表头。
     * 用于 setSorter/sortData 等回调，避免挂载阶段（如 defaultSort）闭包捕获到尚未填充的 tableHeaderLast。
     */
    const getTableHeaderLast = useCallback(() => {
        const headers = tableHeadersForCalcRef.current;
        return headers.slice(-1)[0] || [];
    }, []);

    const tableHeaders = useMemo(() => tableHeadersRef.current, [version]);

    const isTreeData = useMemo(() => columns.some(col => col.type === 'tree-node'), [columns]);

    const hasExpandCol = useMemo(() => tableHeaderLast.some(col => col.type === 'expand'), [tableHeaderLast]);

    const tableHeaderHeight = useMemo(() => {
        return (headerRowHeight as number) * (tableHeadersRef.current.length || 1);
    }, [headerRowHeight, version]);

    // Virtual scroll computed
    const virtual_on = useMemo(() => {
        return virtual && dataSourceCopy.length > virtualScrollRef.current.pageSize;
    }, [virtual, dataSourceCopy, version]);

    const virtual_dataSourcePart = useMemo(() => {
        if (!virtual_on) return dataSourceCopy;
        const { startIndex, endIndex } = virtualScrollRef.current;
        return dataSourceCopy.slice(startIndex, endIndex + 1);
    }, [virtual_on, dataSourceCopy, version]);

    // Virtual scroll functions
    /** 获取行高函数：autoRowHeight 时返回测量/预估高度，展开行返回配置高度 */
    const getRowHeightFn = useMemo(() => {
        const baseRowHeight = rowHeight || DEFAULT_ROW_HEIGHT;
        let fn: (row?: DT) => number = () => baseRowHeight;
        if (autoRowHeight) {
            const temp = fn;
            fn = (r?: DT) => {
                if (r) {
                    const stored = autoRowHeightMapRef.current.get(String(rowKeyGen(r)));
                    if (stored) return stored;
                }
                const expectedHeight = (autoRowHeight as AutoRowHeightConfig<DT>)?.expectedHeight;
                if (expectedHeight) {
                    if (typeof expectedHeight === 'function') return r ? expectedHeight(r) : temp(r);
                    return expectedHeight;
                }
                return temp(r);
            };
        }
        if (hasExpandCol) {
            const expandedRowHeight = expandConfig?.height;
            const temp = fn;
            fn = (r?: DT) => (r && r.__EXP_R__ && expandedRowHeight ? expandedRowHeight : temp(r));
        }
        return fn;
    }, [rowHeight, autoRowHeight, hasExpandCol, expandConfig, rowKeyGen]);

    const virtual_offsetBottom = useMemo(() => {
        if (!virtual_on) return 0;
        const { startIndex, endIndex } = virtualScrollRef.current;
        if (autoRowHeight || hasExpandCol) {
            let offsetBottom = 0;
            for (let i = endIndex + 1; i < dataSourceCopy.length; i++) {
                offsetBottom += getRowHeightFn(dataSourceCopy[i]);
            }
            return offsetBottom;
        }
        const rh = virtualScrollRef.current.rowHeight;
        return (dataSourceCopy.length - startIndex - virtual_dataSourcePart.length) * rh;
    }, [virtual_on, dataSourceCopy, virtual_dataSourcePart, version, autoRowHeight, hasExpandCol, getRowHeightFn]);

    const virtualX_on = useMemo(() => {
        if (!virtualX) return false;
        const totalWidth = tableHeaderLast.reduce((sum, col) => sum + getCalculatedColWidth(col), 0);
        return totalWidth > virtualScrollXRef.current.containerWidth + 100;
    }, [virtualX, tableHeaderLast, version]);

    /** 是否多级表头 */
    const isMultiLevelHeader = useMemo(() => tableHeaders.length > 1, [tableHeaders]);

    /**
     * 多级表头横向虚拟滚动参数：以顶层列组为单位计算开始/结束位置。
     * - 只有整个顶层组完全滚出视口时才移除（避免 colSpan 变化导致抖动）。
     * - 单级表头时退化为与 tbody 相同的参数。
     */
    const theadVirtualX = useMemo(() => {
        if (!virtualX_on || !isMultiLevelHeader) {
            return {
                startIndex: virtualScrollXRef.current.startIndex,
                endIndex: virtualScrollXRef.current.endIndex,
                offsetLeft: virtualScrollXRef.current.offsetLeft,
            };
        }
        const { scrollLeft, containerWidth } = virtualScrollXRef.current;
        const topLevelCols = tableHeaders[0];
        const totalLeafCount = tableHeaderLast.length;

        let theadStartIndex = 0;
        let theadEndIndex = totalLeafCount;
        let theadOffsetLeft = 0;
        let cumLeft = 0;
        let foundStart = false;

        for (let i = 0, len = topLevelCols.length; i < len; i++) {
            const col = topLevelCols[i];
            if (col.fixed === 'left' || col.fixed === 'right') continue;

            const groupWidth = col.__W__ || getCalculatedColWidth(col);
            const groupRight = cumLeft + groupWidth;

            if (!foundStart && groupRight > scrollLeft) {
                foundStart = true;
                theadStartIndex = col.__LF_S__ ?? 0;
                theadOffsetLeft = cumLeft;
            }
            cumLeft = groupRight;

            theadEndIndex = col.__LF_E__ ?? totalLeafCount;
            if (foundStart && groupRight >= scrollLeft + containerWidth) {
                // find end
                break;
            }
        }

        if (!foundStart) {
            theadStartIndex = totalLeafCount;
            theadOffsetLeft = cumLeft;
        }

        return { startIndex: theadStartIndex, endIndex: theadEndIndex, offsetLeft: theadOffsetLeft };
    }, [virtualX_on, isMultiLevelHeader, tableHeaders, tableHeaderLast, version]);

    const virtualX_columnPart = useMemo(() => {
        if (virtualX_on) {
            const { startIndex, endIndex } = virtualScrollXRef.current;
            // 将索引钳制到列数组范围内，防止列数减少时越界
            const maxIndex = tableHeaderLast.length;
            const validEndIndex = Math.min(endIndex, maxIndex);
            const validStartIndex = Math.min(startIndex, maxIndex);

            // 多级表头：分离左/右固定列，插入 spacer 标记实现对齐
            if (isMultiLevelHeader) {
                const leftFixedCols: PrivateStkTableColumn<DT>[] = [];
                const rightFixedCols: PrivateStkTableColumn<DT>[] = [];
                const visibleCols: PrivateStkTableColumn<DT>[] = [];
                for (let i = 0; i < tableHeaderLast.length; i++) {
                    const col = tableHeaderLast[i];
                    if (col.fixed === 'right') {
                        rightFixedCols.push(col);
                    } else if (col.fixed === 'left') {
                        leftFixedCols.push(col);
                    } else if (i >= validStartIndex && i < validEndIndex) {
                        visibleCols.push(col);
                    }
                }

                const result: PrivateStkTableColumn<DT>[] = [];
                result.push(...leftFixedCols);

                // left spacer：theadStart ~ tbodyStart 之间非 fixed:left 的叶子列数
                const theadStart = theadVirtualX.startIndex;
                const leftSpacerColspan = Math.max(0, startIndex - theadStart);
                if (leftSpacerColspan) {
                    result.push({ __VT_C_SP__: leftSpacerColspan } as PrivateStkTableColumn<DT>);
                }

                result.push(...visibleCols);

                // right spacer：tbodyEnd ~ theadEnd 之间的非 fixed:right 列数
                const rightSpacerColspan = Math.max(0, theadVirtualX.endIndex - endIndex);
                if (rightSpacerColspan) {
                    result.push({ __VT_C_SP__: rightSpacerColspan } as PrivateStkTableColumn<DT>);
                }
                result.push(...rightFixedCols);

                return result;
            }

            // 单级表头：保持原有重排逻辑（向后兼容）
            const leftCols: PrivateStkTableColumn<DT>[] = [];
            const rightCols: PrivateStkTableColumn<DT>[] = [];

            // 左侧固定列，如果在左边不可见区。则需要拿出来放在前面
            for (let i = 0; i < validStartIndex; i++) {
                const col = tableHeaderLast[i];
                if (col?.fixed === 'left') leftCols.push(col);
            }
            // 右侧固定列，如果在右边不可见区。则需要拿出来放在后面
            for (let i = validEndIndex; i < tableHeaderLast.length; i++) {
                const col = tableHeaderLast[i];
                if (col?.fixed === 'right') rightCols.push(col);
            }

            const mainColumns = tableHeaderLast.slice(validStartIndex, validEndIndex);
            return leftCols.concat(mainColumns).concat(rightCols);
        }
        return tableHeaderLast;
    }, [virtualX_on, isMultiLevelHeader, theadVirtualX, tableHeaderLast, version]);

    /**
     * 表头横向虚拟滚动：
     * - 单级表头：最后一行使用 virtualX_columnPart，其他行原样返回。
     * - 多级表头：按顶层组粒度过滤（整个组滚出才移除），保持 colSpan 稳定。
     */
    const virtualX_tableHeaders = useMemo(() => {
        if (!virtualX_on) return tableHeaders;
        if (isMultiLevelHeader) {
            const { startIndex, endIndex } = theadVirtualX;
            return tableHeaders.map(row => {
                return row.filter(col => {
                    if (col.fixed === 'left' || col.fixed === 'right') return true;
                    const leafStart = col.__LF_S__ ?? 0;
                    const leafEnd = col.__LF_E__ ?? leafStart + 1;
                    return leafEnd > startIndex && leafStart < endIndex;
                });
            });
        }
        // 单级：最后一行用 virtualX_columnPart
        return tableHeaders.map((row, i) => (i === tableHeaders.length - 1 ? virtualX_columnPart : row));
    }, [virtualX_on, isMultiLevelHeader, theadVirtualX, tableHeaders, virtualX_columnPart]);

    /** 展开行 colspan：虚拟滚动时等于所有 td 元素数量（含 spacer）之和 */
    const expandRowColspan = useMemo(() => {
        if (!virtualX_on) return tableHeaderLast.length;
        const spacers = virtualX_columnPart.filter(c => c.__VT_C_SP__);
        // 2 = vt-x-left + vt-x-right
        // 每个 spacer 项占 1 个位置，colspan > 1 时额外增加 (colspan - 1)
        return 2 + virtualX_columnPart.length + spacers.reduce((sum, s) => sum + Math.max(0, (s.__VT_C_SP__ ?? 0) - 1), 0);
    }, [virtualX_on, virtualX_columnPart, tableHeaderLast]);

    const virtualX_offsetRight = useMemo(() => {
        if (!virtualX_on) return 0;
        // 多级表头使用 theadEndIndex，单级使用 body endIndex
        const endIndex = isMultiLevelHeader ? theadVirtualX.endIndex : virtualScrollXRef.current.endIndex;
        let w = 0;
        for (let i = endIndex; i < tableHeaderLast.length; i++) {
            const col = tableHeaderLast[i];
            if (col.fixed !== 'right') w += getCalculatedColWidth(col);
        }
        return w;
    }, [virtualX_on, isMultiLevelHeader, theadVirtualX, tableHeaderLast, version]);

    // Merge cells: 计算需要隐藏的单元格与合并跨度
    const mergeCellsInfo = useMemo(() => {
        const hiddenCellMap = new Map<UniqKey, Set<UniqKey>>();
        const mergeSpanMap = new Map<string, { colspan?: number; rowspan?: number }>();
        /** rowKey -> 覆盖该行的合并单元格(起始格)cellKey 集合，hover/active 该行时同步高亮对应 rowspan 单元格（key 统一为字符串，兼容数字 key） */
        const hoverRowMap = new Map<string, Set<string>>();
        /** 合并单元格 cellKey -> 起始格位置(rowKey, colKey)，用于定位对应 dom */
        const mergeCellPosMap = new Map<string, { rowKey: UniqKey; colKey: UniqKey }>();
        const headers = tableHeaderLast;
        const hasMerge = headers.some(c => c.mergeCells);
        if (!hasMerge) return { hiddenCellMap, mergeSpanMap, hoverRowMap, mergeCellPosMap };

        const colIndexCache = new Map<UniqKey, number>();
        const hideCells = (rowKey: UniqKey, colKey: UniqKey, colspan: number, isSelfRow: boolean, mergeCellKey: string) => {
            let startIndex = colIndexCache.get(colKey);
            if (startIndex === void 0) {
                startIndex = headers.findIndex(item => colKeyGen(item) === colKey);
                if (startIndex < 0) return;
                colIndexCache.set(colKey, startIndex);
            }
            let hiddenSet = hiddenCellMap.get(rowKey);
            if (!hiddenSet) {
                hiddenSet = new Set();
                hiddenCellMap.set(rowKey, hiddenSet);
            }
            let hoverSet = hoverRowMap.get(String(rowKey));
            if (!hoverSet) {
                hoverSet = new Set();
                hoverRowMap.set(String(rowKey), hoverSet);
            }
            const endIndex = Math.min(startIndex + colspan, headers.length);
            for (let i = startIndex; i < endIndex; i++) {
                hoverSet.add(mergeCellKey);
                if (isSelfRow && i === startIndex) continue;
                const nextCol = headers[i];
                if (!nextCol) break;
                hiddenSet.add(colKeyGen(nextCol));
            }
        };

        for (let rowIndex = 0; rowIndex < virtual_dataSourcePart.length; rowIndex++) {
            const row = virtual_dataSourcePart[rowIndex];
            if (!row || row.__EXP_R__) continue;
            for (let colIndex = 0; colIndex < headers.length; colIndex++) {
                const col = headers[colIndex];
                if (!col.mergeCells) continue;
                let { colspan, rowspan } = col.mergeCells({ row, col, rowIndex, colIndex }) || {};
                colspan = colspan || 1;
                rowspan = rowspan || 1;
                if (colspan === 1 && rowspan === 1) continue;
                const rowKey = rowKeyGen(row);
                const colKey = colKeyGen(col);
                const mergedCellKey = pureCellKeyGen(rowKey, colKey);
                mergeCellPosMap.set(mergedCellKey, { rowKey, colKey });
                for (let i = rowIndex; i < rowIndex + rowspan; i++) {
                    const targetRow = virtual_dataSourcePart[i];
                    if (!targetRow) break;
                    hideCells(rowKeyGen(targetRow), colKey, colspan as number, i === rowIndex, mergedCellKey);
                }
                mergeSpanMap.set(mergedCellKey, { colspan, rowspan });
            }
        }
        return { hiddenCellMap, mergeSpanMap, hoverRowMap, mergeCellPosMap };
    }, [virtual_dataSourcePart, tableHeaderLast, colKeyGen, rowKeyGen]);

    /** 行激活时需要高亮的合并单元格集合（rowspan 覆盖当前激活行的起始格） */
    const activeMergedCells =
        rowActiveProp.enabled && currentRowKey != null
            ? mergeCellsInfo.hoverRowMap.get(String(currentRowKey)) || EMPTY_CELL_KEY_SET
            : EMPTY_CELL_KEY_SET;

    // Merge cells: 统计每一行（全量数据）的最大 rowspan，写入 maxRowSpanRef。
    // 供 updateVirtualScrollY 修正虚拟滚动渲染范围，保证滚动时合并单元格的起始行也被渲染，避免合并被截断导致展示异常。
    useMemo(() => {
        maxRowSpanRef.current.clear();
        const headers = tableHeaderLast;
        const hasMerge = headers.some(c => c.mergeCells);
        if (!hasMerge) return;
        for (let rowIndex = 0; rowIndex < dataSourceCopy.length; rowIndex++) {
            const row = dataSourceCopy[rowIndex];
            if (!row || row.__EXP_R__) continue;
            let maxRowSpan = 1;
            for (let colIndex = 0; colIndex < headers.length; colIndex++) {
                const col = headers[colIndex];
                if (!col.mergeCells) continue;
                const { rowspan } = col.mergeCells({ row, col, rowIndex, colIndex }) || {};
                if (rowspan && rowspan > maxRowSpan) maxRowSpan = rowspan;
            }
            if (maxRowSpan > 1) maxRowSpanRef.current.set(rowKeyGen(row), maxRowSpan);
        }
    }, [dataSourceCopy, tableHeaderLast, rowKeyGen]);

    // Fixed column position
    const getFixedColPosition = useMemo(() => {
        const colKeyStore: Record<string, number> = {};
        const refStore = new WeakMap<StkTableColumn<DT>, number>();
        tableHeadersForCalcRef.current.forEach(cols => {
            let left = 0;
            let rightStartIndex = 0;
            for (let i = 0; i < cols.length; i++) {
                const item = cols[i];
                if (item.fixed === 'left') {
                    const ck = colKeyGen(item);
                    if (ck) colKeyStore[ck] = left;
                    else refStore.set(item, left);
                    left += getCalculatedColWidth(item);
                }
                if (!rightStartIndex && item.fixed === 'right') rightStartIndex = i;
            }
            let right = 0;
            for (let i = cols.length - 1; i >= rightStartIndex; i--) {
                const item = cols[i];
                if (item.fixed === 'right') {
                    const ck = colKeyGen(item);
                    if (ck) colKeyStore[ck] = right;
                    else refStore.set(item, right);
                    right += getCalculatedColWidth(item);
                }
            }
        });
        return (col: StkTableColumn<any>) => {
            const ck = colKeyGen(col);
            return ck ? colKeyStore[ck] : refStore.get(col) || 0;
        };
    }, [version, colKeyGen]);

    // Fixed style
    const getFixedStyle = useCallback(
        (tagType: TagType, col: StkTableColumn<DT>, depth = 0): React.CSSProperties => {
            const { fixed } = col;
            const style: Record<string, any> = {};
            if ((tagType === TagType.TD || tagType === TagType.TF) && !fixed) return style;
            const isFixedLeft = fixed === 'left';
            const { scrollLeft, scrollWidth, offsetLeft, containerWidth } = virtualScrollXRef.current;
            const scrollRight = scrollWidth - containerWidth - scrollLeft;
            if (tagType === TagType.TH) {
                if (!isRelativeMode) {
                    if (depth) style.top = `${depth * (headerRowHeight as number)}px`;
                } else {
                    style.top = `${virtualScrollRef.current.scrollTop}px`;
                }
            } else if (tagType === TagType.TF) {
                style.bottom = '0';
            }
            if (fixed) {
                if (!isRelativeMode) {
                    const lr = getFixedColPosition(col) + 'px';
                    if (isFixedLeft) style.left = lr;
                    else style.right = lr;
                } else {
                    if (isFixedLeft) {
                        style.left = `${scrollLeft - (virtualX_on ? offsetLeft : 0)}px`;
                    } else {
                        style.right = `${Math.max(scrollRight - (virtualX_on ? virtualX_offsetRight : 0), 0)}px`;
                    }
                }
            }
            return style;
        },
        [isRelativeMode, headerRowHeight, getFixedColPosition, virtualX_on, virtualX_offsetRight],
    );

    // Cell style map
    const cellStyleMap = useMemo(() => {
        const thMap = new Map<string, React.CSSProperties>();
        const tdMap = new Map<string, React.CSSProperties>();
        const tfMap = new Map<string, React.CSSProperties>();
        const headers = tableHeadersRef.current;
        for (let depth = 0; depth < headers.length; depth++) {
            const cols = headers[depth];
            for (let i = 0; i < cols.length; i++) {
                const col = cols[i];
                const w = virtualX ? getCalculatedColWidth(col) + 'px' : transformWidthToStr(col.width);
                const minWidthStr = transformWidthToStr(col.minWidth);
                const maxWidthStr = transformWidthToStr(col.maxWidth);
                const baseStyle: Record<string, any> = {};
                if (w) baseStyle['--cw'] = w;
                if (minWidthStr) baseStyle.minWidth = minWidthStr;
                if (maxWidthStr) baseStyle.maxWidth = maxWidthStr;
                const ck = colKeyGen(col);
                thMap.set(ck, { ...baseStyle, ...getFixedStyle(TagType.TH, col, depth) });
                tdMap.set(ck, { ...baseStyle, ...getFixedStyle(TagType.TD, col, depth) });
                tfMap.set(ck, { position: 'sticky', ...baseStyle, ...getFixedStyle(TagType.TF, col, depth) });
            }
        }
        return { [TagType.TH]: thMap, [TagType.TD]: tdMap, [TagType.TF]: tfMap };
    }, [version, virtualX, colKeyGen, getFixedStyle]);

    // Fixed col shadow
    const fixedColsRef = useRef<StkTableColumn<DT>[]>([]);
    const fixedShadowColsRef = useRef<StkTableColumn<DT>[]>([]);

    /** 滚动条变化时，更新需要展示阴影的列 */
    const updateFixedShadow = useCallback(() => {
        const fixedColsTemp: StkTableColumn<DT>[] = [];
        let clientWidth: number;
        let scrollLeft: number;
        if (virtualX_on) {
            const { containerWidth: cw, scrollLeft: sl } = virtualScrollXRef.current;
            clientWidth = cw;
            scrollLeft = sl;
        } else {
            const el = tableContainerRef.current;
            clientWidth = el?.clientWidth || 0;
            scrollLeft = el?.scrollLeft || 0;
        }
        /** 左侧需要展示阴影的列 */
        const leftShadowCol: StkTableColumn<DT>[] = [];
        /** 右侧展示阴影的列 */
        const rightShadowCol: StkTableColumn<DT>[] = [];
        const headers = tableHeadersForCalcRef.current;
        for (let level = 0; level < headers.length; level++) {
            const row = headers[level];
            let left = 0;
            for (let i = 0, rowLen = row.length; i < rowLen; i++) {
                const col = row[i];
                const position = getFixedColPosition(col);
                const isFixedLeft = col.fixed === 'left';
                const isFixedRight = col.fixed === 'right';
                if (isFixedLeft && position + scrollLeft > left) {
                    fixedColsTemp.push(col);
                    leftShadowCol[level] = col;
                }
                left += getCalculatedColWidth(col);
                if (isFixedRight && scrollLeft + clientWidth - left < position) {
                    fixedColsTemp.push(col);
                    // 右固定列阴影，只要第一列
                    if (!rightShadowCol[level]) {
                        rightShadowCol[level] = col;
                    }
                }
            }
        }
        if (fixedColShadow) {
            fixedShadowColsRef.current = leftShadowCol.concat(rightShadowCol).filter(Boolean) as StkTableColumn<DT>[];
        }
        fixedColsRef.current = fixedColsTemp;
    }, [virtualX_on, getFixedColPosition, fixedColShadow]);

    // Fixed col class map
    const fixedColClassMap = useMemo(() => {
        const colMap = new Map();
        const fixedShadowColsValue = fixedShadowColsRef.current;
        const fixedColsValue = fixedColsRef.current;
        const headers = tableHeadersRef.current;
        for (let i = 0; i < headers.length; i++) {
            const cols = headers[i];
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                const fixed = col.fixed;
                const showShadow = fixed && fixedColShadow && fixedShadowColsValue.includes(col);
                const classList: string[] = [];
                if (fixedColsValue.includes(col)) {
                    // 表示该列正在被固定
                    classList.push('fixed-cell--active');
                }
                if (fixed) {
                    classList.push('fixed-cell');
                    classList.push('fixed-cell--' + fixed);
                }
                if (showShadow) {
                    classList.push('fixed-cell--shadow');
                }
                colMap.set(colKeyGen(col), classList);
            }
        }
        return colMap;
    }, [version, colKeyGen, fixedColShadow]);

    // Sort functions
    const getColumnSortState = useCallback(
        (colKeyVal: UniqKey): SortState<DT> | undefined => {
            return sortStates.find(s => s.key === colKeyVal || s.dataIndex === colKeyVal);
        },
        [sortStates],
    );

    const sortData = useCallback(
        (data: DT[], states?: SortState<DT>[]): DT[] => {
            const st = states ?? sortStates;
            if (!st.length) return data;
            const sc = { ...DEFAULT_SORT_CONFIG, ...sortConfig };
            let result = data.slice();
            for (let i = st.length - 1; i >= 0; i--) {
                const state = st[i];
                const col = getTableHeaderLast().find(c => (state.key && colKeyGen(c) === state.key) || c.dataIndex === state.dataIndex);
                if (col && state.order) {
                    const colSortConfig = { ...sc, ...col.sortConfig };
                    result = tableSort(col, state.order, result, colSortConfig);
                }
            }
            return result;
        },
        [sortStates, sortConfig, getTableHeaderLast, colKeyGen],
    );

    // Tree functions
    const flatTreeData = useCallback(
        (data: DT[]): DT[] => {
            const { defaultExpandAll, defaultExpandKeys, defaultExpandLevel } = treeConfig;
            function recursionFlat(items: DT[] | undefined, level: number): DT[] {
                if (!items) return [];
                let result: DT[] = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    result.push(item);
                    if (item.__T_EXP__ === undefined) {
                        if (defaultExpandAll) item.__T_EXP__ = true;
                        else if (defaultExpandLevel && level < defaultExpandLevel) item.__T_EXP__ = true;
                        else if (defaultExpandKeys?.includes(rowKeyGen(item))) item.__T_EXP__ = true;
                        else item.__T_EXP__ = false;
                    }
                    item.__T_LV__ = level;
                    if (item.__T_EXP__) {
                        result = result.concat(recursionFlat(item.children, level + 1));
                    }
                }
                return result;
            }
            return recursionFlat(data, 0);
        },
        [treeConfig, rowKeyGen],
    );

    // Filter
    const filterDataSource = useCallback((data: DT[]) => {
        const filterKeys = Object.keys(filterStatusRef.current);
        if (!filterKeys?.length) return data;
        let result = data;
        for (const key of filterKeys) {
            const { value, filter } = filterStatusRef.current[key];
            if (!value?.length) continue;
            result = result.filter(row => {
                const cellValue = row[key];
                if (filter) return filter({ row, cellValue, filterValues: value });
                return value.some((v: any) => cellValue == v);
            });
        }
        return result;
    }, []);

    // Init data source
    const initDataSource = useCallback(
        (v = dataSource, option?: { forceSort?: boolean }) => {
            let dataSourceTemp = v.slice();
            if (!sortRemote || option?.forceSort) {
                dataSourceTemp = sortData(dataSourceTemp);
            }
            if (isTreeData) {
                dataSourceTemp = flatTreeData(dataSourceTemp);
            }
            dataSourceTemp = filterDataSource(dataSourceTemp);
            setDataSourceCopy(dataSourceTemp);
            return dataSourceTemp;
        },
        [dataSource, sortRemote, sortData, isTreeData, flatTreeData, filterDataSource],
    );

    const updateVirtualScrollY = useCallback(
        (sTop = 0) => {
            const vs = virtualScrollRef.current;
            const dataLength = dataSourceCopy.length;
            const rh = getRowHeightFn();
            const scrollHeight = dataLength * rh + tableHeaderHeight;

            if (scrollbarOptions.enabled) {
                vs.scrollHeight = scrollHeight;
                if (isExperimentalScrollY) {
                    let maxTop: number;
                    sTop = sTop < 0 ? 0 : sTop < (maxTop = scrollHeight - vs.containerHeight) ? sTop : maxTop;
                    vs.translateY = scrollRowByRow ? 0 : -(sTop % rh);
                }
            }
            vs.scrollTop = sTop;

            if (!virtual_on) {
                Object.assign(vs, { startIndex: 0, endIndex: 0, offsetTop: 0 });
                return;
            }

            let startIndex = 0;
            let endIndex = dataLength;
            let autoRowHeightTop = 0;
            if (autoRowHeight || hasExpandCol) {
                // 批量测量已渲染行的实际高度
                if (autoRowHeight) {
                    trRefsMap.current.forEach((tr, rowKey) => {
                        if (!rowKey || autoRowHeightMapRef.current.has(rowKey)) return;
                        autoRowHeightMapRef.current.set(rowKey, tr.offsetHeight);
                    });
                }
                // calculate startIndex
                for (let i = 0; i < dataLength; i++) {
                    const height = getRowHeightFn(dataSourceCopy[i]);
                    autoRowHeightTop += height;
                    if (autoRowHeightTop >= sTop) {
                        startIndex = i;
                        autoRowHeightTop -= height;
                        break;
                    }
                }
                // calculate endIndex
                let containerHeightSum = 0;
                for (let i = startIndex + 1; i < dataLength; i++) {
                    containerHeightSum += getRowHeightFn(dataSourceCopy[i]);
                    if (containerHeightSum >= vs.containerHeight) {
                        endIndex = i;
                        break;
                    }
                }
            } else {
                startIndex = Math.floor(sTop / rh);
                endIndex = startIndex + vs.pageSize;
            }

            // maxRowSpan correction
            if (maxRowSpanRef.current.size) {
                const rawStartIndex = startIndex;
                let correctedStartIndex = startIndex;
                let correctedEndIndex = endIndex;
                // 向前扩展：将“合并范围覆盖到渲染区间”的合并起始行也纳入渲染。
                // 倒序遍历：因为纳入某行后 correctedStartIndex 会前移，可能使更前面的合并起始行也覆盖进来（重叠合并的级联场景）。
                for (let i = startIndex - 1; i >= 0; i--) {
                    const row = dataSourceCopy[i];
                    if (!row) continue;
                    const span = maxRowSpanRef.current.get(rowKeyGen(row)) || 1;
                    if (span <= 1) continue;
                    const spanEndIndex = i + span;
                    if (spanEndIndex > correctedStartIndex) {
                        correctedStartIndex = i;
                        if (spanEndIndex > correctedEndIndex) correctedEndIndex = spanEndIndex;
                    }
                }
                // 向后扩展：保证渲染区间内起始的合并被完整渲染（correctedEndIndex 增长后继续检查新纳入的行）
                for (let i = correctedStartIndex; i < correctedEndIndex; i++) {
                    const row = dataSourceCopy[i];
                    if (!row) continue;
                    const spanEndIndex = i + (maxRowSpanRef.current.get(rowKeyGen(row)) || 1);
                    if (spanEndIndex > correctedEndIndex) correctedEndIndex = spanEndIndex;
                }
                startIndex = correctedStartIndex;
                endIndex = correctedEndIndex;
                // startIndex 被修正后，重算自动行高模式下的顶部偏移，保证 offsetTop 与修正后的 startIndex 一致
                if ((autoRowHeight || hasExpandCol) && startIndex !== rawStartIndex) {
                    autoRowHeightTop = 0;
                    for (let i = 0; i < startIndex; i++) {
                        autoRowHeightTop += getRowHeightFn(dataSourceCopy[i]);
                    }
                }
            }

            if (stripe && !isExperimentalScrollY && startIndex > 0 && startIndex % 2) {
                // 斑马纹情况下，每滚动偶数行才加载。防止斑马纹错位。
                startIndex -= 1;
                if (autoRowHeight || hasExpandCol) {
                    const height = getRowHeightFn(dataSourceCopy[startIndex]);
                    autoRowHeightTop -= height;
                }
            }

            startIndex = Math.max(0, startIndex);
            endIndex = Math.min(endIndex, dataLength);
            if (startIndex >= endIndex) startIndex = endIndex - vs.pageSize;

            let offsetTop = 0;
            if (autoRowHeight || hasExpandCol) {
                offsetTop = autoRowHeightTop;
            } else {
                offsetTop = startIndex * rh;
            }
            Object.assign(vs, { startIndex, endIndex, offsetTop });
        },
        [dataSourceCopy, virtual_on, tableHeaderHeight, scrollbarOptions, isExperimentalScrollY, scrollRowByRow, stripe, rowKeyGen, getRowHeightFn, autoRowHeight, hasExpandCol],
    );

    const getColWidthCache = useCallback((cols: PrivateStkTableColumn<DT>[]) => {
        const cache = colWidthCacheRef.current;
        if (cache.cols === cols) return cache;
        const nonFixedCols: { index: number; cumWidth: number }[] = [];
        const leftFixedCols: { index: number; width: number }[] = [];
        let cumWidth = 0;
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            const w = getCalculatedColWidth(col);
            if (col.fixed === 'left') {
                leftFixedCols.push({ index: i, width: w });
                continue;
            }
            cumWidth += w;
            nonFixedCols.push({ index: i, cumWidth });
        }
        const newCache = { cols, nonFixedCols, leftFixedCols };
        colWidthCacheRef.current = newCache;
        return newCache;
    }, []);

    const updateVirtualScrollX = useCallback(
        (sLeft = 0) => {
            if (!virtualX) return;
            const tableHeaderLastValue = tableHeaderLast;
            const headerLength = tableHeaderLastValue.length;
            if (!headerLength) return;
            const vsx = virtualScrollXRef.current;
            const { containerWidth } = vsx;

            let startIndex = 0;
            let offsetLeft = 0;
            /** 横向滚动时，第一列的剩余宽度 */
            let leftFirstColRestWidth = 0;

            // 使用缓存的累计宽度数组，列配置不变时直接复用
            const { nonFixedCols, leftFixedCols } = getColWidthCache(tableHeaderLastValue);

            if (nonFixedCols.length > 0 && sLeft > 0) {
                // 二分查找：找到第一个累计宽度 > sLeft 的非固定列
                // 使用 <= 确保当列右边缘恰好等于 sLeft 时（列完全滚出视口），不再将其作为起始列
                const found = binarySearch(nonFixedCols, mid => {
                    return nonFixedCols[mid].cumWidth <= sLeft ? -1 : 1;
                });
                const idx = Math.min(found, nonFixedCols.length - 1);
                startIndex = nonFixedCols[idx].index;
                offsetLeft = idx > 0 ? nonFixedCols[idx - 1].cumWidth : 0;
                leftFirstColRestWidth = nonFixedCols[idx].cumWidth - sLeft;
            } else if (nonFixedCols.length > 0) {
                startIndex = nonFixedCols[0].index;
            }

            // 根据 startIndex 快速计算实际在可视区域内的左侧固定列宽度
            let actualLeftColWidthSum = 0;
            for (const leftCol of leftFixedCols) {
                if (leftCol.index >= startIndex) break;
                actualLeftColWidthSum += leftCol.width;
            }
            const containerW = containerWidth - actualLeftColWidthSum;
            let endIndex = headerLength;
            let endColWidthSum = leftFirstColRestWidth;

            /**
             * 这里根据 leftFirstColRestWidth 如果为0 说明开始位置恰好在单元格边界，则计算endIndex 需要从当前单元格开始。
             * 如果有值，则说明开始位置的单元格已经切了一半，需要从下一个单元格开始计算 因此startIndex + 1。
             */
            for (let colIndex = leftFirstColRestWidth ? startIndex + 1 : startIndex; colIndex < headerLength; colIndex++) {
                const col = tableHeaderLastValue[colIndex];
                endColWidthSum += getCalculatedColWidth(col);
                // 列宽大于容器宽度则停止
                if (endColWidthSum >= containerW) {
                    endIndex = colIndex + 1; // slice endIndex + 1
                    break;
                }
            }

            endIndex = Math.min(endIndex, headerLength);
            Object.assign(vsx, { startIndex, endIndex, offsetLeft, scrollLeft: sLeft });
        },
        [virtualX, tableHeaderLast, getColWidthCache],
    );

    const initVirtualScrollY = useCallback(
        (height?: number) => {
            const container = tableContainerRef.current;
            const { clientHeight, scrollHeight } = container || {};
            let scrollTop = isExperimentalScrollY ? virtualScrollRef.current.scrollTop : container?.scrollTop || 0;
            const rh = rowHeight;
            const containerHeight = height || clientHeight || 100;
            let pageSize = Math.ceil(containerHeight / rh);
            if (!headless) {
                const headerToBodyRowHeightCount = Math.floor(tableHeaderHeight / rh);
                pageSize -= headerToBodyRowHeightCount;
            }
            // autoRowHeight/展开行模式下，行高以测量/预估为准，用 dataLength * rh 估算的总高会严重偏小，
            // 导致有效的 scrollTop 被错误钳制（拖动滚动条后视口空白）。这里采用与 offsetTop/offsetBottom 相同的高度模型计算总内容高。
            let totalContentHeight = dataSourceCopy.length * rh + tableHeaderHeight;
            if (autoRowHeight || hasExpandCol) {
                totalContentHeight = tableHeaderHeight;
                for (let i = 0; i < dataSourceCopy.length; i++) totalContentHeight += getRowHeightFn(dataSourceCopy[i]);
            }
            const maxScrollTop = Math.max(0, totalContentHeight - containerHeight);
            if (scrollTop > maxScrollTop) scrollTop = maxScrollTop;
            Object.assign(virtualScrollRef.current, { containerHeight, pageSize, scrollHeight, rowHeight: rh });
            updateVirtualScrollY(scrollTop);
            setVersion(v => v + 1);
        },
        [
            rowHeight,
            headless,
            tableHeaderHeight,
            dataSourceCopy,
            isExperimentalScrollY,
            updateVirtualScrollY,
            autoRowHeight,
            hasExpandCol,
            getRowHeightFn,
        ],
    );

    const initVirtualScrollX = useCallback(() => {
        const container = tableContainerRef.current;
        const { clientWidth, scrollLeft, scrollWidth } = container || {};
        virtualScrollXRef.current.containerWidth = clientWidth || 200;
        virtualScrollXRef.current.scrollWidth = scrollWidth || 200;
        updateVirtualScrollX(scrollLeft);
        setVersion(v => v + 1);
    }, [updateVirtualScrollX]);

    const initVirtualScroll = useCallback(() => {
        initVirtualScrollY();
        initVirtualScrollX();
    }, [initVirtualScrollY, initVirtualScrollX]);

    // ===== scroll-row-by-row =====
    const onlyDragScroll = scrollRowByRow === 'scrollbar';
    /** 是否启用按行滚动 */
    const isSRBRActive = onlyDragScroll ? isDragScroll : !!scrollRowByRow;

    /** scroll-row-by-row 总高度 */
    const SRBRTotalHeight = useMemo(() => {
        if (!isSRBRActive || !virtual) return 0;
        return dataSourceCopy.length * virtualScrollRef.current.rowHeight + tableHeaderHeight;
    }, [isSRBRActive, virtual, dataSourceCopy, tableHeaderHeight, version]);

    const SRBRBottomHeight = useMemo(() => {
        if (!isSRBRActive || !virtual) return 0;
        const { containerHeight, rowHeight: rh } = virtualScrollRef.current;
        return (containerHeight - tableHeaderHeight) % rh;
    }, [isSRBRActive, virtual, tableHeaderHeight, version]);

    // ===== 自定义滚动条 =====
    /** 更新自定义滚动条位置/尺寸 */
    const updateCustomScrollbar = useCallback(() => {
        if (!scrollbarOptions.enabled || isMobileDeviceRef.current) return;
        const { scrollHeight, scrollTop, containerHeight } = virtualScrollRef.current;
        const { scrollWidth, scrollLeft, containerWidth } = virtualScrollXRef.current;

        const needVertical = scrollHeight > containerHeight;
        const needHorizontal = scrollWidth > containerWidth;

        let h = 0;
        let w = 0;
        let t = 0;
        let l = 0;
        if (needVertical) {
            const ratio = containerHeight / scrollHeight;
            h = Math.max(scrollbarOptions.minHeight, ratio * containerHeight);
            t = Math.round((scrollTop / (scrollHeight - containerHeight)) * (containerHeight - h));
        }
        if (needHorizontal) {
            const ratio = containerWidth / scrollWidth;
            w = Math.max(scrollbarOptions.minWidth, ratio * containerWidth);
            l = Math.round((scrollLeft / (scrollWidth - containerWidth)) * (containerWidth - w));
        }
        setShowScrollbar({ x: needHorizontal, y: needVertical });
        setSbThumb({ h, w, t, l });
    }, [scrollbarOptions]);

    const onSbDragEnd = useCallback(() => {
        sbDragRef.current.isVertical = false;
        sbDragRef.current.isHorizontal = false;
        if (sbDragHandlerRef.current) {
            document.removeEventListener('mousemove', sbDragHandlerRef.current);
            document.removeEventListener('touchmove', sbDragHandlerRef.current);
            sbDragHandlerRef.current = undefined;
        }
        document.removeEventListener('mouseup', onSbDragEnd);
        document.removeEventListener('touchend', onSbDragEnd);
    }, []);

    const addSbDragListeners = useCallback(
        (dragHandler: (e: MouseEvent | TouchEvent) => void) => {
            if (sbDragHandlerRef.current) {
                document.removeEventListener('mousemove', sbDragHandlerRef.current);
                document.removeEventListener('touchmove', sbDragHandlerRef.current);
            }
            sbDragHandlerRef.current = dragHandler;
            document.addEventListener('mousemove', dragHandler);
            document.addEventListener('mouseup', onSbDragEnd);
            document.addEventListener('touchmove', dragHandler, { passive: false });
            document.addEventListener('touchend', onSbDragEnd);
        },
        [onSbDragEnd],
    );

    const onVerticalSbDrag = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (!sbDragRef.current.isVertical) return;
            e.preventDefault();
            const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
            const deltaY = clientY - sbDragRef.current.startY;
            const { scrollHeight, containerHeight } = virtualScrollRef.current;
            const scrollRange = scrollHeight - containerHeight;
            const trackRange = containerHeight - sbThumb.h;
            const scrollDelta = (deltaY / trackRange) * scrollRange;

            if (isExperimentalScrollY) {
                const ratio = containerHeight / scrollHeight;
                const top = Math.round((sbDragRef.current.startTop + scrollDelta) * ratio);
                const maxTop = containerHeight - sbThumb.h;
                setSbThumb(prev => ({ ...prev, t: top < 0 ? 0 : top > maxTop ? maxTop : top }));
                updateVirtualScrollY(sbDragRef.current.startTop + scrollDelta);
                setVersion(v => v + 1);
            } else {
                tableContainerRef.current!.scrollTop = sbDragRef.current.startTop + scrollDelta;
            }
        },
        [sbThumb.h, isExperimentalScrollY, updateVirtualScrollY],
    );

    const onHorizontalSbDrag = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (!sbDragRef.current.isHorizontal) return;
            e.preventDefault();
            const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            const deltaX = clientX - sbDragRef.current.startX;
            const { scrollWidth, containerWidth } = virtualScrollXRef.current;
            const scrollRange = scrollWidth - containerWidth;
            const trackRange = containerWidth - sbThumb.w;
            const scrollDelta = (deltaX / trackRange) * scrollRange;
            tableContainerRef.current!.scrollLeft = sbDragRef.current.startLeft + scrollDelta;
        },
        [sbThumb.w],
    );

    const onVerticalScrollbarMouseDown = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (e.type === 'mousedown') e.preventDefault();
            sbDragRef.current.isVertical = true;
            sbDragRef.current.startTop = virtualScrollRef.current.scrollTop;
            const native = e.nativeEvent;
            sbDragRef.current.startY = native instanceof MouseEvent ? native.clientY : (native as TouchEvent).touches[0].clientY;
            addSbDragListeners(onVerticalSbDrag);
        },
        [addSbDragListeners, onVerticalSbDrag],
    );

    const onHorizontalScrollbarMouseDown = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (e.type === 'mousedown') e.preventDefault();
            sbDragRef.current.isHorizontal = true;
            sbDragRef.current.startLeft = virtualScrollXRef.current.scrollLeft;
            const native = e.nativeEvent;
            sbDragRef.current.startX = native instanceof MouseEvent ? native.clientX : (native as TouchEvent).touches[0].clientX;
            addSbDragListeners(onHorizontalSbDrag);
        },
        [addSbDragListeners, onHorizontalSbDrag],
    );

    // Scroll to
    const scrollTo = useCallback(
        (top: number | null = 0, left: number | null = 0) => {
            const container = tableContainerRef.current;
            if (!container) return;
            if (top !== null) {
                if (isExperimentalScrollY) {
                    updateVirtualScrollY(top);
                    setVersion(v => v + 1);
                } else {
                    container.scrollTop = top;
                }
            }
            if (left !== null) container.scrollLeft = left;
        },
        [isExperimentalScrollY, updateVirtualScrollY],
    );

    // ==================== 区域选取 (area selection) ====================
    /** areaSelection 配置归一化 */
    const areaSelectionConfig = useMemo<AreaSelectionConfig>(() => {
        if (typeof areaSelection === 'boolean') {
            const b = areaSelection;
            return { enabled: b, keyboard: b, ctrl: b, shift: b, highlight: { cell: b, row: false } };
        }
        const { highlight: userHighlight, ...restConfig } = areaSelection || {};
        return {
            enabled: true,
            ctrl: true,
            shift: true,
            highlight: {
                cell: true,
                row: false,
                ...userHighlight,
            },
            ...restConfig,
        };
    }, [areaSelection]);

    const [isAreaSelecting, setIsAreaSelecting] = useState(false);
    const isAreaSelectingRef = useRef(false);
    const selectionRangesRef = useRef<AreaSelectionRange[]>([]);
    const anchorCellRef = useRef<{ rowIndex: number; colIndex: number } | null>(null);
    const autoScrollRafIdRef = useRef(0);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const selectedCellKeysRef = useRef<Set<string>>(new Set());
    const areaSelDocListenersRef = useRef<{ mm: (e: MouseEvent) => void; mu: () => void } | null>(null);

    /** colKey → 绝对索引映射 */
    const colKeyToIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        for (let i = 0; i < tableHeaderLast.length; i++) {
            map.set(colKeyGen(tableHeaderLast[i]), i);
        }
        return map;
    }, [tableHeaderLast, colKeyGen]);

    /**
     * 预计算每个列索引位置对应的左右固定列累计宽度
     * @returns (colIndex) => [leftFixedWidth, rightFixedWidth]
     */
    const getFixedColWidths = useMemo(() => {
        const cols = tableHeaderLast;
        const leftWidths: number[] = new Array(cols.length + 1).fill(0);
        const rightWidths: number[] = new Array(cols.length + 1).fill(0);

        let leftSum = 0;
        for (let i = 0; i < cols.length; i++) {
            leftWidths[i] = leftSum;
            if (cols[i]?.fixed === 'left') {
                leftSum += getCalculatedColWidth(cols[i]);
            }
        }
        leftWidths[cols.length] = leftSum;

        let rightSum = 0;
        for (let i = cols.length - 1; i >= 0; i--) {
            rightWidths[i] = rightSum;
            if (cols[i]?.fixed === 'right') {
                rightSum += getCalculatedColWidth(cols[i]);
            }
        }

        return (colIndex: number) => {
            return [leftWidths[colIndex] ?? 0, rightWidths[colIndex + 1] ?? 0] as const;
        };
    }, [tableHeaderLast]);

    function emitSelectionChange() {
        onAreaSelectionChange?.(selectionRangesRef.current);
    }

    /**
     * 直接操作 DOM 更新选区样式（不触发 React re-render）
     * 避免拖选时频繁触发整个表格重渲染
     */
    function updateSelectionDOM() {
        const container = tableContainerRef.current;
        if (!container) return;

        const cellHighlight = areaSelectionConfig.highlight?.cell;
        const rowHighlight = areaSelectionConfig.highlight?.row;

        // 1. 清除所有旧的选区 class
        const oldSelectedCells = container.querySelectorAll(`.${CELL_RANGE_SELECTED}`);
        for (let i = 0; i < oldSelectedCells.length; i++) {
            const el = oldSelectedCells[i] as HTMLElement;
            el.classList.remove(CELL_RANGE_SELECTED, CELL_RANGE_TOP, CELL_RANGE_BOTTOM, CELL_RANGE_LEFT, CELL_RANGE_RIGHT);
        }
        const oldSelectedRows = container.querySelectorAll(`.${ROW_RANGE_SELECTED}`);
        for (let i = 0; i < oldSelectedRows.length; i++) {
            (oldSelectedRows[i] as HTMLElement).classList.remove(ROW_RANGE_SELECTED);
        }

        // 2. 重算 selectedCellKeys
        const ranges = selectionRangesRef.current;
        const keys = new Set<string>();
        if (ranges.length) {
            for (const range of ranges) {
                const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
                for (let r = minRow; r <= maxRow; r++) {
                    const row = dataSourceCopy[r];
                    if (!row) continue;
                    for (let c = minCol; c <= maxCol; c++) {
                        const col = tableHeaderLast[c];
                        if (col) keys.add(cellKeyGen(row, col));
                    }
                }
            }
        }
        selectedCellKeysRef.current = keys;

        if (!ranges.length) return;

        const tbody = container.querySelector('.stk-tbody-main');
        if (!tbody) return;

        // 3. 应用行高亮 class
        if (rowHighlight) {
            for (const range of ranges) {
                const { minRow, maxRow } = normalizeRange(range);
                for (let r = minRow; r <= maxRow; r++) {
                    const tr = tbody.querySelector(`tr[data-row-i="${r}"]`) as HTMLElement | null;
                    if (tr) tr.classList.add(ROW_RANGE_SELECTED);
                }
            }
        }

        // 4. 应用单元格高亮 class
        if (cellHighlight) {
            const lastRange = ranges[ranges.length - 1];
            const { minRow: lrMinRow, maxRow: lrMaxRow, minCol: lrMinCol, maxCol: lrMaxCol } = normalizeRange(lastRange);

            // 遍历所有可见行
            const trs = tbody.querySelectorAll('tr[data-row-i]');
            for (let t = 0; t < trs.length; t++) {
                const tr = trs[t] as HTMLElement;
                const rowIndex = parseInt(tr.getAttribute('data-row-i')!, 10);

                // 检查此行是否在任何选区内
                let inAnyRange = false;
                for (const range of ranges) {
                    const { minRow, maxRow } = normalizeRange(range);
                    if (rowIndex >= minRow && rowIndex <= maxRow) {
                        inAnyRange = true;
                        break;
                    }
                }
                if (!inAnyRange) continue;

                // 遍历此行中的单元格
                const tds = tr.querySelectorAll('td[data-col-key]');
                for (let d = 0; d < tds.length; d++) {
                    const td = tds[d] as HTMLElement;
                    const colKey = td.getAttribute('data-col-key')!;
                    const colIndex = colKeyToIndexMap.get(colKey);
                    if (colIndex === void 0 || colIndex < 0) continue;

                    // 生成 cellKey 检查是否在选区内
                    const row = dataSourceCopy[rowIndex];
                    const col = tableHeaderLast[colIndex];
                    if (!row || !col) continue;
                    const ck = cellKeyGen(row, col);
                    if (!keys.has(ck)) continue;

                    td.classList.add(CELL_RANGE_SELECTED);

                    // 判断是否在最后一个区域的边界
                    const isInLastRange = rowIndex >= lrMinRow && rowIndex <= lrMaxRow && colIndex >= lrMinCol && colIndex <= lrMaxCol;
                    if (isInLastRange) {
                        if (rowIndex === lrMinRow) td.classList.add(CELL_RANGE_TOP);
                        if (rowIndex === lrMaxRow) td.classList.add(CELL_RANGE_BOTTOM);
                        if (colIndex === lrMinCol) td.classList.add(CELL_RANGE_LEFT);
                        if (colIndex === lrMaxCol) td.classList.add(CELL_RANGE_RIGHT);
                    }
                }
            }
        }
    }

    /** 更新最后一个选区的终点（拖拽过程中） */
    function updateSelectionEnd(endRowIndex: number, endColIndex: number) {
        const anchor = anchorCellRef.current;
        if (!anchor) return;
        const newRange = makeRange(anchor.rowIndex, anchor.colIndex, endRowIndex, endColIndex);
        const ranges = [...selectionRangesRef.current];
        if (ranges.length > 0) {
            ranges[ranges.length - 1] = newRange;
        } else {
            ranges.push(newRange);
        }
        selectionRangesRef.current = ranges;
        updateSelectionDOM();
    }

    /** 从 MouseEvent 目标元素更新选区 */
    function updateSelectionFromEvent(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target) return;

        const rowIndex = getClosestTrIndex(target);
        if (Number.isNaN(rowIndex) || rowIndex < 0) return;

        const colKey = getClosestColKey(target);
        const colIndex = colKey ? colKeyToIndexMap.get(colKey) ?? -1 : -1;
        if (colIndex < 0) return;

        updateSelectionEnd(rowIndex, colIndex);
    }

    // ---- 边界自动滚动 ----

    /** 停止自动滚动 */
    function stopAutoScroll() {
        if (autoScrollRafIdRef.current) {
            cancelAnimationFrame(autoScrollRafIdRef.current);
            autoScrollRafIdRef.current = 0;
        }
    }

    /** 将鼠标位置钳制到容器内部，用 elementFromPoint 找到边缘单元格并更新选区 */
    function updateSelectionFromPoint(container: HTMLElement, containerRect: DOMRect) {
        // 获取表头高度，钳制 Y 时跳过表头区域
        const thead = container.querySelector('thead');
        const { top, bottom, left, right } = containerRect;

        const headerBottom = thead ? top + (thead as HTMLElement).offsetHeight : top;

        const x = Math.max(left + POINT_EDGE_OFFSET, Math.min(lastMouseRef.current.x, right - POINT_EDGE_OFFSET));
        const y = Math.max(headerBottom + POINT_EDGE_OFFSET, Math.min(lastMouseRef.current.y, bottom - POINT_EDGE_OFFSET));

        const el = document.elementFromPoint(x, y);
        if (!el) return;

        const td = getClosestTd(el as HTMLElement);
        const tr = getClosestTr(el as HTMLElement);
        if (!td || !tr) return;

        const rowIndex = getClosestTrIndex(tr as HTMLElement);
        const colKey = getClosestColKey(td as HTMLElement);
        const colIndex = colKey ? colKeyToIndexMap.get(colKey) ?? -1 : -1;

        if (Number.isNaN(rowIndex) || rowIndex < 0 || colIndex < 0) return;

        updateSelectionEnd(rowIndex, colIndex);
    }

    /** rAF 循环：边界自动滚动 + 更新选区 */
    function autoScrollLoop() {
        const container = tableContainerRef.current;
        if (!container || !isAreaSelectingRef.current) {
            stopAutoScroll();
            return;
        }

        const rect = container.getBoundingClientRect();
        const { deltaX, deltaY } = calculateAutoScrollDelta(lastMouseRef.current.x, lastMouseRef.current.y, rect);

        if (deltaX !== 0 || deltaY !== 0) {
            container.scrollTop += deltaY;
            container.scrollLeft += deltaX;

            // 滚动后，在容器内边缘处用 elementFromPoint 找到当前单元格更新选区
            updateSelectionFromPoint(container, rect);
        }

        // 如果还在拖选且仍需滚动，继续循环
        if (isAreaSelectingRef.current && (deltaX !== 0 || deltaY !== 0)) {
            autoScrollRafIdRef.current = requestAnimationFrame(autoScrollLoop);
        } else {
            autoScrollRafIdRef.current = 0;
        }
    }

    /** 检查鼠标是否在容器边缘附近，启动或停止自动滚动 */
    function checkAutoScroll() {
        const container = tableContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const { top, bottom, left, right } = rect;

        const nearEdge =
            lastMouseRef.current.y < top + EDGE_ZONE ||
            lastMouseRef.current.y > bottom - EDGE_ZONE ||
            lastMouseRef.current.x < left + EDGE_ZONE ||
            lastMouseRef.current.x > right - EDGE_ZONE;

        if (nearEdge && !autoScrollRafIdRef.current) {
            autoScrollLoop();
        } else if (!nearEdge && autoScrollRafIdRef.current) {
            stopAutoScroll();
        }
    }

    /** document mousemove 处理：更新选区终点 + 检测边界自动滚动 */
    function onDocumentMouseMove(e: MouseEvent) {
        if (!isAreaSelectingRef.current) return;

        lastMouseRef.current = { x: e.clientX, y: e.clientY };

        // 尝试从当前鼠标位置更新选区
        updateSelectionFromEvent(e);

        // 检测是否需要边界自动滚动
        checkAutoScroll();
    }

    /** document mouseup 处理：结束拖选 */
    function onDocumentMouseUp() {
        if (!isAreaSelectingRef.current) return;
        isAreaSelectingRef.current = false;
        setIsAreaSelecting(false);
        stopAutoScroll();

        const l = areaSelDocListenersRef.current;
        if (l) {
            document.removeEventListener('mousemove', l.mm);
            document.removeEventListener('mouseup', l.mu);
            areaSelDocListenersRef.current = null;
        }

        // 发出事件
        emitSelectionChange();
    }

    /** mousedown 处理：设置锚点，开始拖选 */
    function onSelectionMouseDown(e: MouseEvent) {
        if (!areaSelectionConfig.enabled || e.button !== 0) return;

        const rowIndex = getClosestTrIndex(e.target as HTMLElement);
        const colKey = getClosestColKey(e.target as HTMLElement);
        const colIndex = colKey ? colKeyToIndexMap.get(colKey) ?? -1 : -1;

        if (Number.isNaN(rowIndex) || rowIndex < 0 || colIndex < 0) return;

        const ctrlKey = e.ctrlKey || e.metaKey;

        const range = makeRange(rowIndex, colIndex, rowIndex, colIndex);
        // Shift 扩选：从锚点扩展到当前位置，更新最后一个区域
        if (e.shiftKey && anchorCellRef.current && areaSelectionConfig.shift) {
            const ranges = selectionRangesRef.current.slice();
            const shiftRange = makeRange(anchorCellRef.current.rowIndex, anchorCellRef.current.colIndex, rowIndex, colIndex);
            if (ranges.length) {
                ranges[ranges.length - 1] = shiftRange;
            } else {
                ranges.push(shiftRange);
            }
            selectionRangesRef.current = ranges;
        } else {
            anchorCellRef.current = { rowIndex, colIndex };
            if (ctrlKey && areaSelectionConfig.ctrl) {
                // Ctrl 多选
                selectionRangesRef.current = selectionRangesRef.current.concat([range]);
            } else {
                // 普通点击
                selectionRangesRef.current = [range];
            }
        }

        isAreaSelectingRef.current = true;
        setIsAreaSelecting(true);
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        updateSelectionDOM();

        // 防止拖选时选中文字
        const mm = onDocumentMouseMove;
        const mu = onDocumentMouseUp;
        areaSelDocListenersRef.current = { mm, mu };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    }

    /** 始终指向最新的 onSelectionMouseDown，避免事件回调闭包过期 */
    const onSelectionMouseDownRef = useRef(onSelectionMouseDown);
    onSelectionMouseDownRef.current = onSelectionMouseDown;

    /** 获取列的左边距和宽度
     * @param colIndex 列的绝对索引
     * @returns [left, width]
     */
    function getColPosition(colIndex: number): [number, number] {
        let left = 0;
        for (let i = 0; i < tableHeaderLast.length; i++) {
            const colWidth = getCalculatedColWidth(tableHeaderLast[i]);
            if (i === colIndex) return [left, colWidth];
            left += colWidth;
        }
        return [left, 0];
    }

    /**
     * 滚动到指定单元格，确保其在可视区域内
     * @param rowIndex 行索引
     * @param colIndex 列索引
     */
    function scrollToCell(rowIndex: number, colIndex: number) {
        const container = tableContainerRef.current;
        if (!container) return;

        const row = dataSourceCopy[rowIndex];
        const col = tableHeaderLast[colIndex];
        if (!row || !col) return;

        const thead = container.querySelector('thead');
        const headerHeight = thead ? (thead as HTMLElement).offsetHeight : 0;
        const tfoot = container.querySelector('tfoot');
        const footerHeight = tfoot ? (tfoot as HTMLElement).offsetHeight : 0;

        const vs = virtualScrollRef.current;
        const vsx = virtualScrollXRef.current;

        // 是否开启按行滚动模式
        const isScrollRowByRow = scrollRowByRow;

        // 计算目标行的位置（基于虚拟滚动数据）
        const rh = vs.rowHeight;
        const targetRowTop = rowIndex * rh;
        const targetRowBottom = targetRowTop + rh;

        // 计算可视区域
        // experimental.scrollY 模式下，容器 scrollTop 始终为 0，需要使用 virtualScroll.scrollTop
        const visibleTop = isScrollRowByRow ? vs.scrollTop : container.scrollTop;
        const visibleBottom = visibleTop + vs.containerHeight - headerHeight - footerHeight;

        // 计算需要的垂直滚动位置
        let newScrollTop: number | null = null;
        if (targetRowTop < visibleTop) {
            // 目标行在可视区域上方，滚动到使目标行位于顶部
            newScrollTop = targetRowTop;
        } else if (targetRowBottom > visibleBottom) {
            // 目标行在可视区域下方
            newScrollTop = targetRowBottom - (vs.containerHeight - headerHeight - footerHeight);
        }

        // 计算目标列的位置
        const [targetColLeft, targetColWidth] = getColPosition(colIndex);
        const targetColRight = targetColLeft + targetColWidth;

        // 计算可视区域（水平）
        const visibleLeft = container.scrollLeft;
        const visibleRight = visibleLeft + vsx.containerWidth;

        // 计算固定列的宽度（用于检测遮挡）
        const [leftFixedWidth, rightFixedWidth] = getFixedColWidths(colIndex);
        let newScrollLeft: number | null = null;
        if (targetColLeft < visibleLeft + leftFixedWidth) {
            // 目标列在左侧固定列遮挡区域内，需要向左滚动
            newScrollLeft = targetColLeft - leftFixedWidth;
        } else if (targetColRight > visibleRight - rightFixedWidth) {
            // 目标列在右侧固定列遮挡区域内，需要向右滚动
            newScrollLeft = targetColRight - vsx.containerWidth + rightFixedWidth;
        }

        if (newScrollTop !== null || newScrollLeft !== null) {
            scrollTo(newScrollTop, newScrollLeft);
        }
    }

    function blurCellElement() {
        // 防止虚拟滚动移除 DOM 时焦点被动丢失，导致后续 keydown 无法冒泡到容器
        const container = tableContainerRef.current;
        const activeEl = document.activeElement as HTMLElement | null;
        if (container && activeEl && container.contains(activeEl) && activeEl !== container) {
            container.focus({ preventScroll: true });
        }
    }

    /**
     * 区域选取键盘事件
     * Ctrl+C / Cmd+C 复制；Esc 取消；方向键 / Tab 移动（keyboard=true 时）
     */
    function onAreaSelectionKeydown(e: React.KeyboardEvent) {
        if (!areaSelectionConfig.enabled) return;

        const key = e.key;

        // Esc：取消
        if (key === KEY_ESCAPE || key === KEY_ESC) {
            blurCellElement();
            if (selectionRangesRef.current.length) {
                e.preventDefault();
            }
            return;
        }

        // Ctrl/Cmd+C 复制
        if ((e.ctrlKey || e.metaKey) && key === KEY_C && selectionRangesRef.current.length) {
            copySelectedArea();
            e.preventDefault();
            return;
        }

        if (!areaSelectionConfig.keyboard) return;

        const isArrowKey = [KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT].includes(key);
        const isTabKey = key === KEY_TAB;
        const isNavigationKey = isArrowKey || isTabKey;

        if (!isNavigationKey) return;

        e.preventDefault();

        const rowCount = dataSourceCopy.length;
        const colCount = tableHeaderLast.length;
        if (rowCount === 0 || colCount === 0) return;

        // 如果没有选区，默认从第一个单元格开始
        if (!selectionRangesRef.current.length) {
            anchorCellRef.current = { rowIndex: 0, colIndex: 0 };
            selectionRangesRef.current = [makeRange(0, 0, 0, 0)];
            updateSelectionDOM();
            emitSelectionChange();
            scrollToCell(0, 0);
            return;
        }

        // 计算移动方向
        const [rowDelta, colDelta] = getMovementDelta(key, e.shiftKey);

        // Shift 扩展选区，否则移动单格选区
        if (e.shiftKey && isArrowKey && areaSelectionConfig.shift) {
            blurCellElement();
            // 扩展选区：保留 begin，更新最后一个区域的 end
            const ranges = [...selectionRangesRef.current];
            const range = ranges.length > 0 ? ranges[ranges.length - 1] : null;
            if (!range) return;
            const { begin, end } = range.index;
            let newEndRow = end.row + rowDelta;
            let newEndCol = end.col + colDelta;

            // 边界检查
            newEndRow = clampNum(newEndRow, 0, rowCount - 1);
            newEndCol = clampNum(newEndCol, 0, colCount - 1);

            ranges[ranges.length - 1] = makeRange(begin.row, begin.col, newEndRow, newEndCol);
            selectionRangesRef.current = ranges;
            updateSelectionDOM();

            scrollToCell(newEndRow, newEndCol);
        } else {
            blurCellElement();
            // 移动单格选区：取最后一个区域的 min 位置作为基础，清空旧选区重建
            const ranges = selectionRangesRef.current;
            const range = ranges.length > 0 ? ranges[ranges.length - 1] : null;
            const baseRow = range ? normalizeRange(range).minRow : 0;
            const baseCol = range ? normalizeRange(range).minCol : 0;
            let newRow = baseRow + rowDelta;
            let newCol = baseCol + colDelta;

            // 边界检查（先检查，避免越界）
            newRow = clampNum(newRow, 0, rowCount - 1);
            newCol = clampNum(newCol, 0, colCount - 1);

            // Tab 换行逻辑：如果到达行尾/行首，换行
            if (isTabKey) {
                // 计算原始未 clamp 的值
                const rawCol = baseCol + colDelta;
                const [tabRow, tabCol] = handleTabWrap(baseRow, newCol, rawCol, rowCount, colCount);
                newRow = tabRow;
                newCol = tabCol;
            }

            // 更新锚点和选区（移动单格时清空其他区域，仅保留新位置）
            anchorCellRef.current = { rowIndex: newRow, colIndex: newCol };
            selectionRangesRef.current = [makeRange(newRow, newCol, newRow, newCol)];
            updateSelectionDOM();

            scrollToCell(newRow, newCol);
        }

        emitSelectionChange();
    }

    /**
     * 复制选区内容到剪贴板，只复制最后一个选区
     * @returns text
     */
    function copySelectedArea(): string {
        const ranges = selectionRangesRef.current;
        if (!ranges.length) return '';

        const range = ranges[ranges.length - 1];
        const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
        const formatCell = areaSelectionConfig.formatCellForClipboard;

        const lines: string[] = [];
        for (let r = minRow; r <= maxRow; r++) {
            const row = dataSourceCopy[r];
            if (!row) continue;

            const cells: string[] = [];
            for (let c = minCol; c <= maxCol; c++) {
                const col = tableHeaderLast[c];
                if (!col) {
                    cells.push('');
                    continue;
                }
                const rawValue = row[col.dataIndex];
                cells.push(formatCell ? formatCell(row, col, rawValue) : !rawValue ? '' : String(rawValue));
            }
            lines.push(cells.join('\t'));
        }
        const text = lines.join('\n');

        navigator.clipboard.writeText(text).catch(() => {
            console.warn('Failed to copy to clipboard');
        });

        return text;
    }

    /** 获取选中的单元格信息 */
    function getSelectedArea() {
        const ranges = selectionRangesRef.current;
        if (!ranges.length) return { rows: [] as DT[], cols: [] as StkTableColumn<DT>[], ranges: [] as AreaSelectionRange[] };
        // 收集所有区域的行和列
        const rowSet = new Set<number>();
        const colSet = new Set<number>();
        for (const range of ranges) {
            const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
            for (let r = minRow; r <= maxRow; r++) rowSet.add(r);
            for (let c = minCol; c <= maxCol; c++) colSet.add(c);
        }
        const sortedRows = [...rowSet].sort((a, b) => a - b);
        const sortedCols = [...colSet].sort((a, b) => a - b);
        return {
            rows: sortedRows.map(i => dataSourceCopy[i]).filter(Boolean),
            cols: sortedCols.map(i => tableHeaderLast[i]).filter(Boolean),
            ranges: ranges.map(r => ({ ...r })),
        };
    }

    function clearSelectedArea() {
        selectionRangesRef.current = [];
        isAreaSelectingRef.current = false;
        setIsAreaSelecting(false);
        updateSelectionDOM();
    }

    const getRowIndexFn = (row: DT) => {
        const targetKey = rowKeyGen(row);
        return dataSourceCopy.findIndex(item => rowKeyGen(item) === targetKey);
    };

    const getColumnIndexFn = (column: any) => {
        const targetKey = colKeyGen(column);
        return tableHeaderLast.findIndex(item => colKeyGen(item) === targetKey);
    };

    function setAreaSelection(ranges?: AreaSelectionSetterRange<DT>, option: AreaSelectionSetterOption = {}): AreaSelectionRange[] {
        if (!areaSelectionConfig.enabled) return selectionRangesRef.current;

        const { silent = false, scrollToView = false } = option;
        const rowCount = dataSourceCopy.length;
        const colCount = tableHeaderLast.length;

        if (rowCount <= 0 || colCount <= 0) {
            clearSelectedArea();
            if (!silent) emitSelectionChange();
            return selectionRangesRef.current;
        }

        const maxRow = rowCount - 1;
        const maxCol = colCount - 1;

        let beginRow = 0;
        let endRow = maxRow;
        let beginCol = 0;
        let endCol = maxCol;

        if (ranges) {
            const begin = ranges.begin;
            const end = ranges.end ?? begin;

            beginRow = typeof begin.row === 'number' ? begin.row : getRowIndexFn(begin.row);
            endRow = typeof end.row === 'number' ? end.row : getRowIndexFn(end.row);

            const beginColInput = typeof begin.col === 'number' ? begin.col : begin.col ? getColumnIndexFn(begin.col) : void 0;
            const endColInput = typeof end.col === 'number' ? end.col : end.col ? getColumnIndexFn(end.col) : void 0;

            if (beginColInput !== void 0) {
                beginCol = beginColInput;
                endCol = endColInput !== void 0 ? endColInput : beginColInput;
            } else if (endColInput !== void 0) {
                beginCol = 0;
                endCol = endColInput;
            }
        }

        beginRow = clampNum(beginRow, 0, maxRow);
        endRow = clampNum(endRow, 0, maxRow);
        beginCol = clampNum(beginCol, 0, maxCol);
        endCol = clampNum(endCol, 0, maxCol);

        selectionRangesRef.current = [makeRange(beginRow, beginCol, endRow, endCol)];
        anchorCellRef.current = { rowIndex: beginRow, colIndex: beginCol };
        isAreaSelectingRef.current = false;
        setIsAreaSelecting(false);
        updateSelectionDOM();

        if (scrollToView) {
            scrollToCell(endRow, endCol);
        }

        if (!silent) emitSelectionChange();
        return selectionRangesRef.current;
    }

    // 虚拟滚动等导致 DOM 重建后，重新应用选区样式
    useEffect(() => {
        updateSelectionDOM();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version, dataSourceCopy, tableHeaderLast, areaSelectionConfig, colKeyToIndexMap]);

    // 卸载时清理拖选监听与自动滚动
    useEffect(() => {
        return () => {
            const l = areaSelDocListenersRef.current;
            if (l) {
                document.removeEventListener('mousemove', l.mm);
                document.removeEventListener('mouseup', l.mu);
                areaSelDocListenersRef.current = null;
            }
            if (autoScrollRafIdRef.current) {
                cancelAnimationFrame(autoScrollRafIdRef.current);
                autoScrollRafIdRef.current = 0;
            }
        };
    }, []);

    // 监听数据行数/列数变化，当行列变少时钳制选区与锚点，避免越界
    useEffect(() => {
        if (!areaSelectionConfig.enabled) return;

        const rowCount = dataSourceCopy.length;
        const colCount = tableHeaderLast.length;

        // 钳制锚点
        const anchor = anchorCellRef.current;
        if (anchor) {
            if (rowCount === 0 || colCount === 0) {
                anchorCellRef.current = null;
            } else {
                anchor.rowIndex = clampNum(anchor.rowIndex, 0, rowCount - 1);
                anchor.colIndex = clampNum(anchor.colIndex, 0, colCount - 1);
            }
        }

        const ranges = selectionRangesRef.current;
        if (!ranges.length) return;

        // 行或列为 0 时清空选区
        if (rowCount === 0 || colCount === 0) {
            clearSelectedArea();
            emitSelectionChange();
            return;
        }

        const maxRow = rowCount - 1;
        const maxCol = colCount - 1;
        let changed = false;
        const newRanges: AreaSelectionRange[] = [];
        for (const range of ranges) {
            const { begin, end } = range.index;
            const nbRow = clampNum(begin.row, 0, maxRow);
            const nbCol = clampNum(begin.col, 0, maxCol);
            const neRow = clampNum(end.row, 0, maxRow);
            const neCol = clampNum(end.col, 0, maxCol);
            if (nbRow !== begin.row || nbCol !== begin.col || neRow !== end.row || neCol !== end.col) {
                changed = true;
                newRanges.push(makeRange(nbRow, nbCol, neRow, neCol));
            } else {
                newRanges.push(range);
            }
        }

        if (changed) {
            selectionRangesRef.current = newRanges;
            emitSelectionChange();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSourceCopy.length, tableHeaderLast.length]);

    // Scroll handler
    const onTableScroll = useCallback(
        (e: React.UIEvent) => {
            if (scrollRAFScheduledRef.current) return;
            scrollRAFScheduledRef.current = true;
            requestAnimationFrame(() => {
                scrollRAFScheduledRef.current = false;
                const target = e.target as HTMLElement;
                const { scrollTop, scrollLeft } = target;
                const { scrollTop: vScrollTop } = virtualScrollRef.current;
                const { scrollLeft: vScrollLeft } = virtualScrollXRef.current;
                const isYScroll = isExperimentalScrollY ? false : scrollTop !== vScrollTop;
                const isXScroll = scrollLeft !== vScrollLeft;

                if (isYScroll) {
                    updateVirtualScrollY(scrollTop);
                    setVersion(v => v + 1);
                }
                if (isXScroll) {
                    if (virtualX_on) {
                        updateVirtualScrollX(scrollLeft);
                    } else {
                        virtualScrollXRef.current.scrollLeft = scrollLeft;
                    }
                    updateFixedShadow();
                    setVersion(v => v + 1);
                }
                if (isYScroll) {
                    const { startIndex, endIndex } = virtualScrollRef.current;
                    onScroll?.(e.nativeEvent, { startIndex, endIndex });
                }
                if (isXScroll) {
                    onScrollX?.(e.nativeEvent);
                }
                updateCustomScrollbar();
            });
        },
        [isExperimentalScrollY, virtualX_on, updateVirtualScrollY, updateVirtualScrollX, updateFixedShadow, onScroll, onScrollX, updateCustomScrollbar],
    );

    // Wheel handler
    const onTableWheel = useCallback(
        (e: React.WheelEvent) => {
            if (smoothScroll) return;
            if (isColResizing) {
                e.stopPropagation();
                return;
            }
            const dom = tableContainerRef.current;
            if (!dom) return;
            const { deltaY, deltaX, shiftKey } = e;

            if (virtual_on && deltaY && !shiftKey) {
                const { containerHeight, scrollTop, scrollHeight } = virtualScrollRef.current;
                const canScrollDown = scrollTop < scrollHeight - containerHeight - 1;
                const canScrollUp = scrollTop > 1;
                if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) {
                    e.preventDefault();
                }
                if (isExperimentalScrollY) {
                    updateVirtualScrollY(scrollTop + deltaY);
                    updateCustomScrollbar();
                    setVersion(v => v + 1);
                } else {
                    dom.scrollTop += deltaY;
                }
            }
            if (virtualX_on) {
                let distance = deltaX;
                if (shiftKey && deltaY) distance = deltaY;
                dom.scrollLeft += distance;
            }
        },
        [smoothScroll, isColResizing, virtual_on, virtualX_on, isExperimentalScrollY, updateVirtualScrollY, updateCustomScrollbar],
    );

    // Sort handler
    const onColumnSort = useCallback(
        (col: StkTableColumn<DT>) => {
            if (!col?.sorter) return;
            const sc: SortConfig<DT> = { ...DEFAULT_SORT_CONFIG, ...sortConfig, ...col.sortConfig };
            const colKeyVal = colKeyGen(col);
            const existingIndex = sortStates.findIndex(s => s.key === colKeyVal || s.dataIndex === colKeyVal);
            let newOrder: Order;

            const defaultSort = sc.defaultSort;

            if (existingIndex >= 0) {
                const currentOrder = sortStates[existingIndex].order;
                if (currentOrder && defaultSort && (defaultSort.key === colKeyVal || defaultSort.dataIndex === col.dataIndex)) {
                    // 点击的是默认排序列：仅在 desc/asc 之间切换，不会取消排序
                    const defaultSwitchOrder = SORT_SWITCH_ORDER.filter(order => order !== null);
                    const currentIndex = defaultSwitchOrder.indexOf(currentOrder);
                    newOrder = defaultSwitchOrder[(currentIndex + 1) % defaultSwitchOrder.length];
                } else {
                    const currentIndex = SORT_SWITCH_ORDER.indexOf(currentOrder);
                    newOrder = SORT_SWITCH_ORDER[(currentIndex + 1) % 3];
                }
            } else {
                newOrder = SORT_SWITCH_ORDER[1];
            }

            let newStates: SortState<DT>[];
            if (newOrder) {
                const newState: SortState<DT> = {
                    key: colKeyVal,
                    dataIndex: col.dataIndex,
                    sortField: col.sortField,
                    sortType: col.sortType,
                    order: newOrder,
                };
                if (sc.multiSort) {
                    const filtered = sortStates.filter(s => s.key !== colKeyVal && s.dataIndex !== colKeyVal);
                    newStates = [newState, ...filtered].slice(0, sc.multiSortLimit ?? 3);
                } else {
                    newStates = [newState];
                }
            } else {
                newStates = sortStates.filter(s => s.key !== colKeyVal && s.dataIndex !== colKeyVal);
                if (defaultSort?.order) {
                    // 取消排序后回退到默认排序列
                    const defaultSortCol = tableHeaderLast.find(c => (defaultSort.key && colKeyGen(c) === defaultSort.key) || c.dataIndex === defaultSort.dataIndex);
                    const defaultState: SortState<DT> = {
                        key: defaultSort.key ?? defaultSortCol?.key,
                        dataIndex: defaultSort.dataIndex,
                        sortField: defaultSort.sortField ?? defaultSortCol?.sortField,
                        sortType: defaultSort.sortType ?? defaultSortCol?.sortType,
                        order: defaultSort.order,
                    };
                    const defaultKey = defaultState.key || defaultState.dataIndex;
                    const filtered = newStates.filter(s => s.key !== defaultKey && s.dataIndex !== defaultKey);
                    newStates = sc.multiSort ? [defaultState, ...filtered].slice(0, sc.multiSortLimit ?? 3) : [defaultState];
                }
            }
            setSortStates(newStates);

            if (!sortRemote) {
                let data = dataSource.slice();
                // Apply sort with new states
                for (let i = newStates.length - 1; i >= 0; i--) {
                    const state = newStates[i];
                    const sortCol = tableHeaderLast.find(c => (state.key && colKeyGen(c) === state.key) || c.dataIndex === state.dataIndex);
                    if (sortCol && state.order) {
                        data = tableSort(sortCol, state.order, data, { ...DEFAULT_SORT_CONFIG, ...sortConfig });
                    }
                }
                if (isTreeData) data = flatTreeData(data);
                data = filterDataSource(data);
                setDataSourceCopy(data);
            }
            onSortChange?.(col, newOrder, dataSourceCopy, sc);
        },
        [
            sortStates,
            sortConfig,
            colKeyGen,
            sortRemote,
            dataSource,
            tableHeaderLast,
            isTreeData,
            flatTreeData,
            filterDataSource,
            dataSourceCopy,
            onSortChange,
        ],
    );

    // Row click
    const handleRowClick = useCallback(
        (e: React.MouseEvent) => {
            const rowIndex = getClosestTrIndex(e.target as HTMLElement);
            const row = dataSourceCopy[rowIndex];
            if (!row) return;
            onRowClick?.(e, row, { rowIndex });
            if (rowActiveProp.disabled?.(row)) return;
            const isCurrentRow = rowKey ? currentRowKey === rowKeyGen(row) : currentRowRef.current === row;
            if (isCurrentRow) {
                if (!rowActiveProp.revokable) return;
                setCurrentRowKey(undefined);
                currentRowRef.current = undefined;
            } else {
                setCurrentRowKey(rowKeyGen(row));
                currentRowRef.current = row;
            }
            onCurrentChange?.(e, row, { select: !isCurrentRow });
        },
        [dataSourceCopy, rowActiveProp, rowKey, currentRowKey, rowKeyGen, onRowClick, onCurrentChange],
    );

    const handleRowDblclick = useCallback(
        (e: React.MouseEvent) => {
            const rowIndex = getClosestTrIndex(e.target as HTMLElement);
            const row = dataSourceCopy[rowIndex];
            if (!row) return;
            onRowDblclick?.(e, row, { rowIndex });
        },
        [dataSourceCopy, onRowDblclick],
    );

    const handleRowMenu = useCallback(
        (e: React.MouseEvent) => {
            const rowIndex = getClosestTrIndex(e.target as HTMLElement);
            const row = dataSourceCopy[rowIndex];
            if (!row) return;
            onRowMenu?.(e, row, { rowIndex });
        },
        [dataSourceCopy, onRowMenu],
    );

    // Cell click
    const handleCellClick = useCallback(
        (e: React.MouseEvent) => {
            const rowIndex = getClosestTrIndex(e.target as HTMLElement);
            const row = dataSourceCopy[rowIndex];
            if (!row) return;
            const colKeyVal = getClosestColKey(e.target as HTMLElement);
            const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyVal);
            if (!col) return;
            if ((e.target as HTMLElement)?.closest('.stk-fold-icon')) {
                if (col.type === 'expand') toggleExpandRow(row, col);
                else if (col.type === 'tree-node') toggleTreeNode(row, col);
                return;
            }
            if (cellActive) {
                const ck = cellKeyGen(row, col);
                const result = { row, col, select: false, rowIndex };
                if (selectedCellRevokable && currentSelectedCellKey === ck) {
                    setCurrentSelectedCellKey(undefined);
                } else {
                    setCurrentSelectedCellKey(ck);
                    result.select = true;
                }
                onCellSelected?.(e, result);
            }
            onCellClick?.(e, row, col, { rowIndex });
        },
        [
            dataSourceCopy,
            tableHeaderLast,
            colKeyGen,
            cellActive,
            selectedCellRevokable,
            currentSelectedCellKey,
            cellKeyGen,
            onCellSelected,
            onCellClick,
        ],
    );

    // Cell mouse events
    const handleCellMouseOver = useCallback(
        (e: React.MouseEvent) => {
            const td = getClosestTd(e.target as HTMLElement);
            if (!td) return;
            const rowIndex = getClosestTrIndex(e.target as HTMLElement) || 0;
            const row = dataSourceCopy[rowIndex];
            const colKeyVal = getClosestColKey(e.target as HTMLElement);
            const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyVal) as any;
            onCellMouseover?.(e, row, col);
            const related = e.relatedTarget as Node | null;
            if (!related || !td.contains(related)) {
                onCellMouseenter?.(e, row, col);
            }
        },
        [dataSourceCopy, tableHeaderLast, colKeyGen, onCellMouseover, onCellMouseenter],
    );

    /** 当前 hover 高亮的合并单元格 cellKey 集合（不触发重渲染，直接操作 dom class） */
    const hoverMergedCellsRef = useRef<Set<string>>(EMPTY_CELL_KEY_SET);

    /**
     * 更新 rowspan 合并单元格的 hover 高亮（对齐 stk-table-vue）
     * hover 到被 rowspan 覆盖的行时，同步高亮对应的合并起始单元格
     */
    const updateHoverMergedCells = useCallback(
        (rowKey: UniqKey | null | undefined) => {
            const { hoverRowMap, mergeCellPosMap } = mergeCellsInfo;
            const nextSet = (rowKey != null && hoverRowMap.get(String(rowKey))) || EMPTY_CELL_KEY_SET;
            const prevSet = hoverMergedCellsRef.current;
            if (prevSet === nextSet) return;
            const findMergeTd = (cellKey: string) => {
                const pos = mergeCellPosMap.get(cellKey);
                if (!pos) return null;
                const tr = trRefsMap.current.get(String(pos.rowKey));
                return (tr?.querySelector(`td[data-col-key="${pos.colKey}"]`) as HTMLElement) || null;
            };
            for (const cellKey of prevSet) {
                if (nextSet.has(cellKey)) continue;
                findMergeTd(cellKey)?.classList.remove('cell-hover');
            }
            for (const cellKey of nextSet) {
                if (prevSet.has(cellKey)) continue;
                findMergeTd(cellKey)?.classList.add('cell-hover');
            }
            hoverMergedCellsRef.current = nextSet;
        },
        [mergeCellsInfo],
    );

    const handleTbodyMouseOut = useCallback(
        (e: React.MouseEvent) => {
            const target = e.target as HTMLElement;
            const related = e.relatedTarget as Node | null;
            const td = getClosestTd(target);
            if (td && (!related || !td.contains(related))) {
                const rowIndex = getClosestTrIndex(target) || 0;
                const row = dataSourceCopy[rowIndex];
                const colKeyVal = getClosestColKey(target);
                const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyVal) as any;
                onCellMouseleave?.(e, row, col);
            }
            const tr = getClosestTr(target);
            if (tr && (!related || !tr.contains(related))) {
                currentHoverRowRef.current = null;
                if (showTrHoverClass) setCurrentHoverRowKey(null);
                if (rowHover) updateHoverMergedCells(null);
            }
        },
        [dataSourceCopy, tableHeaderLast, colKeyGen, showTrHoverClass, rowHover, updateHoverMergedCells, onCellMouseleave],
    );

    const handleCellMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const rowIndex = getClosestTrIndex(e.target as HTMLElement) || 0;
            const row = dataSourceCopy[rowIndex];
            const colKeyVal = getClosestColKey(e.target as HTMLElement);
            const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyVal) as any;
            onCellMousedown?.(e, row, col, { rowIndex });

            // 区域选取：设置锚点并开始拖选
            onSelectionMouseDownRef.current(e.nativeEvent);
        },
        [dataSourceCopy, tableHeaderLast, colKeyGen, onCellMousedown],
    );

    // Tr mouse over
    const handleTrMouseOver = useCallback(
        (e: React.MouseEvent) => {
            const tr = getClosestTr(e.target as HTMLElement);
            if (!tr) return;
            const rowIndex = Number((tr as HTMLElement).dataset.rowI);
            const row = dataSourceCopy[rowIndex];
            if (currentHoverRowRef.current === row) return;
            currentHoverRowRef.current = row;
            const rowKey = (tr as HTMLElement).dataset.rowKey || null;
            if (showTrHoverClass) {
                setCurrentHoverRowKey(rowKey);
            }
            if (rowHover) {
                updateHoverMergedCells(rowKey);
            }
        },
        [dataSourceCopy, showTrHoverClass, rowHover, updateHoverMergedCells],
    );

    // Expand row
    const toggleExpandRow = useCallback((row: DT, col: StkTableColumn<DT>) => {
        const isExpand = row.__EXP__ === col ? !row.__EXP__ : true;
        setRowExpandFn(row, isExpand, { col });
    }, []);

    const setRowExpandFn = useCallback(
        (rowKeyOrRow: string | undefined | DT, expand?: boolean | null, data?: { col?: StkTableColumn<DT>; silent?: boolean }) => {
            setDataSourceCopy(prev => {
                const tempData = prev.slice();
                let rk: UniqKey;
                if (typeof rowKeyOrRow === 'string') rk = rowKeyOrRow;
                else rk = rowKeyGen(rowKeyOrRow);
                const index = tempData.findIndex(it => rowKeyGen(it) === rk);
                if (index === -1) return prev;
                // Remove existing expanded row
                for (let i = index + 1; i < tempData.length; i++) {
                    const item: PrivateRowDT = tempData[i];
                    if (item.__R_K__?.startsWith('expanded-')) {
                        tempData.splice(i, 1);
                        i--;
                    } else break;
                }
                const row = tempData[index];
                const col = data?.col;
                let exp = expand;
                if (exp == null) exp = row.__EXP__ === col ? !row.__EXP__ : true;
                if (exp) {
                    const newExpandRow: PrivateRowDT = { __R_K__: 'expanded-' + rk, __EXP_R__: row, __EXP_C__: col };
                    tempData.splice(index + 1, 0, newExpandRow);
                }
                if (row) row.__EXP__ = exp ? col : void 0;
                if (!data?.silent) onToggleRowExpand?.({ expanded: Boolean(exp), row, col: col || null });
                return tempData;
            });
        },
        [rowKeyGen, onToggleRowExpand],
    );

    // Tree
    const toggleTreeNode = useCallback(
        (row: DT, col: any) => {
            const expand = row ? !row.__T_EXP__ : false;
            setDataSourceCopy(prev => {
                const tempData = prev.slice();
                const rk = rowKeyGen(row);
                const index = tempData.findIndex(it => rowKeyGen(it) === rk);
                if (index === -1) return prev;
                const r = tempData[index];
                const level = r.__T_LV__ || 0;
                if (expand) {
                    const children = expandNode(r, level);
                    tempData.splice(index + 1, 0, ...children);
                } else {
                    let deleteCount = 0;
                    for (let i = index + 1; i < tempData.length; i++) {
                        if (tempData[i].__T_LV__ && tempData[i].__T_LV__! > level) deleteCount++;
                        else break;
                    }
                    tempData.splice(index + 1, deleteCount);
                }
                r.__T_EXP__ = expand;
                onToggleTreeExpand?.({ expanded: Boolean(expand), row: r, col: col || null });
                return tempData;
            });
        },
        [rowKeyGen, onToggleTreeExpand],
    );

    function expandNode(row: DT, level: number): DT[] {
        let result: DT[] = [];
        row.children?.forEach((child: DT) => {
            result.push(child);
            const childLv = level + 1;
            if (child.__T_EXP__ && child.children) {
                result = result.concat(expandNode(child, childLv));
            } else {
                child.__T_EXP__ = false;
                child.__T_LV__ = childLv;
            }
        });
        return result;
    }

    // Header drag
    const handleThDragStart = useCallback(
        (e: React.DragEvent) => {
            const th = (e.target as HTMLElement).closest('th');
            if (!th) return;
            const dragStartKey = (th as HTMLElement).dataset.colKey || '';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', dragStartKey);
            onThDragStartCb?.(dragStartKey);
        },
        [onThDragStartCb],
    );

    const handleThDragOver = useCallback((e: React.DragEvent) => {
        const th = (e.target as HTMLElement).closest('th');
        if (!th) return;
        if ((th as HTMLElement).getAttribute('draggable') !== 'true') return;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
    }, []);

    const handleThDrop = useCallback(
        (e: React.DragEvent) => {
            const th = (e.target as HTMLElement).closest('th');
            if (!th) return;
            const dragStartKey = e.dataTransfer.getData('text');
            const targetKey = (th as HTMLElement).dataset.colKey;
            if (dragStartKey !== targetKey) {
                const cols = columns.slice();
                const dragStartIndex = cols.findIndex(col => colKeyGen(col) === dragStartKey);
                const dragEndIndex = cols.findIndex(col => colKeyGen(col) === targetKey);
                if (dragStartIndex !== -1 && dragEndIndex !== -1) {
                    const dragStartCol = cols[dragStartIndex];
                    const mode = typeof headerDrag === 'object' ? headerDrag.mode || 'insert' : 'insert';
                    if (mode === 'swap') {
                        cols[dragStartIndex] = cols[dragEndIndex];
                        cols[dragEndIndex] = dragStartCol;
                    } else if (mode !== 'none') {
                        cols.splice(dragStartIndex, 1);
                        cols.splice(dragEndIndex, 0, dragStartCol);
                    }
                    onUpdateColumns?.(cols);
                }
                onColOrderChange?.(dragStartKey, targetKey!);
            }
            onThDropCb?.(targetKey!);
        },
        [columns, colKeyGen, headerDrag, onUpdateColumns, onColOrderChange, onThDropCb],
    );

    // Row drag
    const trDragFlagRef = useRef(false);
    const oldTrRef = useRef<HTMLElement | null>(null);

    const handleTrDragStart = useCallback((e: React.DragEvent, rowIndex: number) => {
        const tr = getClosestTr(e.target as HTMLElement);
        if (tr) {
            const trRect = tr.getBoundingClientRect();
            const x = e.clientX - (trRect.left ?? 0);
            e.dataTransfer.setDragImage(tr, x, trRect.height / 2);
            tr.classList.add('tr-dragging');
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(rowIndex));
        trDragFlagRef.current = true;
    }, []);

    const handleTrDragOver = useCallback((e: React.DragEvent) => {
        if (!trDragFlagRef.current) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleTrDragEnter = useCallback((e: React.DragEvent) => {
        if (!trDragFlagRef.current) return;
        e.preventDefault();
        const tr = getClosestTr(e.target as HTMLElement);
        if (oldTrRef.current && oldTrRef.current !== tr) {
            oldTrRef.current.classList.remove('tr-dragging-over');
        }
        if (tr) {
            oldTrRef.current = tr as HTMLElement;
            tr.classList.add('tr-dragging-over');
        }
    }, []);

    const handleTrDragEnd = useCallback((e: React.DragEvent) => {
        if (!trDragFlagRef.current) return;
        const tr = getClosestTr(e.target as HTMLElement);
        if (tr) tr.classList.remove('tr-dragging');
        if (oldTrRef.current) {
            oldTrRef.current.classList.remove('tr-dragging-over');
            oldTrRef.current = null;
        }
        trDragFlagRef.current = false;
    }, []);

    const handleBodyDrop = useCallback(
        (e: React.DragEvent) => {
            if (!trDragFlagRef.current) return;
            const trIndex = getClosestTrIndex(e.target as HTMLElement);
            if (trIndex < 0) return;
            const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
            const endIndex = trIndex;
            if (sourceIndex === endIndex) return;
            const mode = dragRowConfig?.mode || 'insert';
            if (mode !== 'none') {
                setDataSourceCopy(prev => {
                    const temp = prev.slice();
                    const sourceRow = temp[sourceIndex];
                    if (mode === 'swap') {
                        temp[sourceIndex] = temp[endIndex];
                        temp[endIndex] = sourceRow;
                    } else {
                        temp.splice(sourceIndex, 1);
                        temp.splice(endIndex, 0, sourceRow);
                    }
                    return temp;
                });
            }
            onRowOrderChange?.(String(sourceIndex), String(endIndex));
        },
        [dragRowConfig, onRowOrderChange],
    );

    // Col resize
    const colResizeStateRef = useRef<any>({ currentCol: null, lastCol: null, startX: 0, startOffsetTableX: 0, revertMoveX: false });

    const colResizeOn = useMemo(() => {
        if (typeof colResizable === 'object') {
            return (col: StkTableColumn<DT>) => !(colResizable as any).disabled(col);
        }
        return () => colResizable;
    }, [colResizable]);

    const handleThResizeMouseDown = useCallback(
        (e: React.MouseEvent, col: StkTableColumn<DT>, leftHandle = false) => {
            const container = tableContainerRef.current;
            if (!container) return;
            e.stopPropagation();
            e.preventDefault();
            const { clientX } = e;
            const { scrollLeft, scrollTop } = container;
            const { left } = container.getBoundingClientRect();
            let targetCol = col;
            if (leftHandle) {
                const colKeyVal = colKeyGen(col);
                const colIndex = tableHeaderLast.findIndex(it => colKeyGen(it) === colKeyVal);
                if (colIndex - 1 >= 0) targetCol = tableHeaderLast[colIndex - 1];
            }
            const offsetTableX = clientX - left + scrollLeft;
            setIsColResizing(true);
            colResizeStateRef.current = {
                currentCol: targetCol,
                lastCol: findLastChildCol(targetCol),
                startX: clientX,
                startOffsetTableX: offsetTableX,
                revertMoveX: false,
            };
            if (colResizeIndicatorRef.current) {
                colResizeIndicatorRef.current.style.display = 'block';
                colResizeIndicatorRef.current.style.left = offsetTableX + 'px';
                colResizeIndicatorRef.current.style.top = scrollTop + 'px';
            }
        },
        [colKeyGen, tableHeaderLast],
    );

    function findLastChildCol(column: StkTableColumn<DT> | null): StkTableColumn<DT> | null {
        if (column?.children?.length) {
            return findLastChildCol(column.children.slice(-1)[0] as StkTableColumn<DT>);
        }
        return column;
    }

    useEffect(() => {
        if (!colResizable) return;
        const onMove = (e: MouseEvent) => {
            if (!isColResizing) return;
            e.stopPropagation();
            e.preventDefault();
            const { lastCol, startX, startOffsetTableX } = colResizeStateRef.current;
            const moveX = e.clientX - startX;
            const currentColWidth = getCalculatedColWidth(lastCol);
            const mw = lastCol?.minWidth ?? colMinWidth;
            let adjustedMoveX = moveX;
            if (currentColWidth + moveX < mw) adjustedMoveX = -currentColWidth;
            const offsetTableX = startOffsetTableX + adjustedMoveX;
            if (colResizeIndicatorRef.current) {
                colResizeIndicatorRef.current.style.left = offsetTableX + 'px';
            }
        };
        const onUp = (e: MouseEvent) => {
            if (!isColResizing) return;
            const { startX, lastCol, revertMoveX } = colResizeStateRef.current;
            const moveX = revertMoveX ? startX - e.clientX : e.clientX - startX;
            let w = getCalculatedColWidth(lastCol) + moveX;
            if (w < colMinWidth) w = colMinWidth;
            const ck = colKeyGen(lastCol);
            const curCol = tableHeaderLast.find(it => colKeyGen(it) === ck);
            if (curCol) {
                curCol.width = w + 'px';
                onUpdateColumns?.(columns.slice());
                onColResize?.({ ...curCol });
                setVersion(v => v + 1);
            }
            if (colResizeIndicatorRef.current) {
                colResizeIndicatorRef.current.style.display = 'none';
                colResizeIndicatorRef.current.style.left = '0';
                colResizeIndicatorRef.current.style.top = '0';
            }
            setIsColResizing(false);
            colResizeStateRef.current = { currentCol: null, lastCol: null, startX: 0, startOffsetTableX: 0, revertMoveX: false };
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [colResizable, isColResizing, colMinWidth, colKeyGen, tableHeaderLast, columns, onUpdateColumns, onColResize]);

    // Highlight
    const [setHighlightDimRow, setHighlightDimCell] = useHighlight(highlightConfig, theme, stkTableId, tableContainerRef);

    // Set current row
    const setCurrentRow = useCallback(
        (rowKeyOrRow: string | undefined | DT, option: { silent?: boolean; deep?: boolean } = {}) => {
            const select = rowKeyOrRow !== void 0;
            if (!select) {
                currentRowRef.current = undefined;
                setCurrentRowKey(undefined);
            } else if (typeof rowKeyOrRow === 'string') {
                setCurrentRowKey(rowKeyOrRow);
                const row = dataSourceCopy.find(item => rowKeyGen(item) === rowKeyOrRow);
                if (row) currentRowRef.current = row;
            } else {
                currentRowRef.current = rowKeyOrRow;
                setCurrentRowKey(rowKeyGen(rowKeyOrRow));
            }
            if (!option.silent) {
                onCurrentChange?.(null, select ? currentRowRef.current : undefined, { select });
            }
        },
        [dataSourceCopy, rowKeyGen, onCurrentChange],
    );

    // Set selected cell
    const setSelectedCell = useCallback(
        (row?: DT, col?: StkTableColumn<DT>, option: { silent?: boolean } = { silent: false }) => {
            if (!dataSourceCopy.length) return;
            const select = row !== void 0 && col !== void 0;
            setCurrentSelectedCellKey(select ? cellKeyGen(row, col) : undefined);
            if (!option.silent) {
                onCellSelected?.(null, { row, col, select });
            }
        },
        [dataSourceCopy, cellKeyGen, onCellSelected],
    );

    // Set sorter
    const setSorter = useCallback(
        (colKeyVal: string, order: Order, option: any = {}) => {
            const { silent = true, sort = true } = option;
            let newStates: SortState<DT>[] = [];
            if (order) {
                const column = getTableHeaderLast().find(it => colKeyGen(it) === colKeyVal);
                if (column) {
                    newStates = [
                        {
                            key: colKeyVal,
                            dataIndex: column.dataIndex,
                            sortField: column.sortField,
                            sortType: column.sortType,
                            order,
                        },
                    ];
                }
            }
            setSortStates(newStates);
            if (sort && dataSource.length) {
                if (!sortRemote || option.force) {
                    // 使用新状态同步排序，避免 setSortStates 异步导致用旧状态排序
                    let data = sortData(dataSource.slice(), newStates);
                    if (isTreeData) data = flatTreeData(data);
                    data = filterDataSource(data);
                    setDataSourceCopy(data);
                }
            }
            return dataSourceCopy;
        },
        [getTableHeaderLast, colKeyGen, dataSource, sortRemote, sortData, isTreeData, flatTreeData, filterDataSource, dataSourceCopy],
    );

    const resetSorter = useCallback(() => {
        setSortStates([]);
        initDataSource();
    }, [initDataSource]);

    const getSortColumns = useCallback(() => {
        return sortStates.map(s => ({ key: s.key || s.dataIndex, order: s.order }));
    }, [sortStates]);

    // Set filter
    const setFilter = useCallback(
        (status: Record<UniqKey, any> | null, option?: { remote?: boolean; silent?: boolean }) => {
            status = status || {};
            filterStatusRef.current = status;
            if (!option?.remote) initDataSource();
            if (!option?.silent) onFilterChange?.(status);
        },
        [initDataSource, onFilterChange],
    );

    // Auto resize
    useEffect(() => {
        if (!autoResize) return;
        if (!virtual && !virtualX) return;
        const container = tableContainerRef.current;
        if (!container) return;
        let debounceTime = 0;
        const resizeCallback = () => {
            if (debounceTime) window.clearTimeout(debounceTime);
            debounceTime = window.setTimeout(() => {
                initVirtualScroll();
                if (typeof autoResize === 'function') autoResize();
                debounceTime = 0;
            }, 200);
        };
        let resizeObserver: ResizeObserver | null = null;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(resizeCallback);
            resizeObserver.observe(container);
        } else {
            window.addEventListener('resize', resizeCallback);
        }
        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            else window.removeEventListener('resize', resizeCallback);
        };
    }, [autoResize, virtual, virtualX, initVirtualScroll]);

    // Keyboard arrow scroll
    useEffect(() => {
        if (!virtual_on) return;
        let isMouseOver = false;
        const container = tableContainerRef.current;
        const handleKeydown = (e: KeyboardEvent) => {
            if (!isMouseOver) return;
            const codes = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'PageUp', 'PageDown', 'Home', 'End'];
            if (!codes.includes(e.code)) return;
            e.preventDefault();
            const { scrollTop, rowHeight: rh, containerHeight, scrollHeight } = virtualScrollRef.current;
            const { scrollLeft } = virtualScrollXRef.current;
            const headerHeight = headless ? 0 : tableHeadersRef.current.length * (headerRowHeight as number);
            const bodyPageSize = Math.floor((containerHeight - headerHeight) / rh);
            if (e.code === 'ArrowUp') scrollTo(scrollTop - rh, null);
            else if (e.code === 'ArrowDown') scrollTo(scrollTop + rh, null);
            else if (e.code === 'ArrowRight') scrollTo(null, scrollLeft + 50);
            else if (e.code === 'ArrowLeft') scrollTo(null, scrollLeft - 50);
            else if (e.code === 'PageUp') scrollTo(scrollTop - rh * bodyPageSize + headerHeight, null);
            else if (e.code === 'PageDown') scrollTo(scrollTop + rh * bodyPageSize - headerHeight, null);
            else if (e.code === 'Home') scrollTo(0, null);
            else if (e.code === 'End') scrollTo(scrollHeight, null);
        };
        const handleMouseEnter = () => {
            isMouseOver = true;
        };
        const handleMouseLeave = () => {
            isMouseOver = false;
        };
        window.addEventListener('keydown', handleKeydown);
        container?.addEventListener('mouseenter', handleMouseEnter);
        container?.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            container?.removeEventListener('mouseenter', handleMouseEnter);
            container?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [virtual_on, headless, headerRowHeight, scrollTo]);

    // Init on mount
    useEffect(() => {
        dealColumns(columns);
        setVersion(v => v + 1);
    }, []);

    useEffect(() => {
        initDataSource();
    }, [dataSource]);

    // 数据变化后更新虚拟滚动参数与自定义滚动条
    useEffect(() => {
        updateVirtualScrollY(virtualScrollRef.current.scrollTop);
        updateCustomScrollbar();
    }, [dataSourceCopy, updateVirtualScrollY, updateCustomScrollbar]);

    useEffect(() => {
        dealColumns(columns);
        setVersion(v => v + 1);
        requestAnimationFrame(() => {
            initVirtualScrollX();
            updateCustomScrollbar();
        });
    }, [columns]);

    useEffect(() => {
        requestAnimationFrame(() => {
            initVirtualScroll();
            updateFixedShadow();
            updateCustomScrollbar();
            setVersion(v => v + 1);
            // Deal default sorter
            if (sortConfig.defaultSort) {
                const { key, dataIndex, order, silent } = { silent: true, ...sortConfig.defaultSort };
                setSorter((key || dataIndex) as string, order, { force: false, silent });
            }
        });
    }, []);

    // 自定义滚动条：设备检测 + 容器尺寸变化监听
    useEffect(() => {
        isMobileDeviceRef.current = isTouchPrimaryDevice();
        if (!scrollbarOptions.enabled || isMobileDeviceRef.current) return;
        const container = tableContainerRef.current;
        if (!container) return;
        const throttledUpdate = throttle(() => updateCustomScrollbar(), 200);
        const resizeObserver = new ResizeObserver(throttledUpdate);
        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
        };
    }, [scrollbarOptions.enabled, updateCustomScrollbar]);

    // scroll-row-by-row：'scrollbar' 模式监听容器 mousedown/mouseup
    useEffect(() => {
        if (!onlyDragScroll) return;
        const container = tableContainerRef.current;
        if (!container) return;
        const handleMouseDown = (e: MouseEvent) => {
            const el = e.target as HTMLElement;
            if (el.classList.contains('stk-table')) {
                if (srbrDebounceRef.current) {
                    window.clearTimeout(srbrDebounceRef.current);
                    srbrDebounceRef.current = 0;
                }
                setIsDragScroll(true);
            }
        };
        const handleMouseUp = () => {
            if (srbrDebounceRef.current) window.clearTimeout(srbrDebounceRef.current);
            srbrDebounceRef.current = window.setTimeout(() => {
                setIsDragScroll(false);
                srbrDebounceRef.current = 0;
            }, 300);
        };
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mouseup', handleMouseUp);
        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mouseup', handleMouseUp);
            if (srbrDebounceRef.current) window.clearTimeout(srbrDebounceRef.current);
        };
    }, [onlyDragScroll]);

    // Expose ref
    useImperativeHandle(
        ref,
        () => ({
            initVirtualScroll,
            initVirtualScrollX,
            initVirtualScrollY,
            setCurrentRow,
            setSelectedCell,
            setHighlightDimCell,
            setHighlightDimRow,
            sortCol: () => sortStates[0]?.dataIndex,
            sortStates: () => sortStates,
            getSortColumns,
            setSorter,
            resetSorter,
            scrollTo,
            getTableData: () => dataSourceCopy,
            getRowIndex: (row: DT) => {
                const targetKey = rowKeyGen(row);
                return dataSourceCopy.findIndex(item => rowKeyGen(item) === targetKey);
            },
            getColumnIndex: (column: any) => {
                const targetKey = colKeyGen(column);
                return tableHeaderLast.findIndex(item => colKeyGen(item) === targetKey);
            },
            setRowExpand: setRowExpandFn,
            setAutoHeight: (rowKeyVal: UniqKey, height?: number | null) => {
                const key = String(rowKeyVal);
                if (!height) autoRowHeightMapRef.current.delete(key);
                else autoRowHeightMapRef.current.set(key, height);
            },
            clearAllAutoHeight: () => autoRowHeightMapRef.current.clear(),
            setTreeExpand: (row: any, option?: { expand?: boolean }) => {
                // Simplified tree expand
                toggleTreeNode(row, null);
            },
            getSelectedArea,
            setAreaSelection,
            clearSelectedArea,
            copySelectedArea,
            setFilter,
        }),
        [
            initVirtualScroll,
            initVirtualScrollX,
            initVirtualScrollY,
            setCurrentRow,
            setSelectedCell,
            setHighlightDimCell,
            setHighlightDimRow,
            sortStates,
            getSortColumns,
            setSorter,
            resetSorter,
            scrollTo,
            dataSourceCopy,
            rowKeyGen,
            colKeyGen,
            tableHeaderLast,
            setRowExpandFn,
            toggleTreeNode,
            setFilter,
            areaSelectionConfig,
            onAreaSelectionChange,
        ],
    );

    // Helper functions for rendering
    const getAbsoluteRowIndex = (rowIndex: number) => rowIndex + virtualScrollRef.current.startIndex;

    const getHeaderTitle = (col: StkTableColumn<DT>): string => {
        const ck = colKeyGen(col);
        if (hideHeaderTitle === true || (Array.isArray(hideHeaderTitle) && hideHeaderTitle.includes(ck))) return '';
        return col.title || '';
    };

    const isHeaderDraggable = (col: StkTableColumn<DT>) => {
        if (!headerDrag) return false;
        if (typeof headerDrag === 'object') return !headerDrag.disabled?.(col);
        return true;
    };

    // Container class
    const containerClass = useMemo(() => {
        const classes = ['stk-table'];
        if (virtual) classes.push('virtual');
        if (virtualX) classes.push('virtual-x');
        if (virtual_on) classes.push('vt-on');
        if (theme === 'light') classes.push('light');
        if (theme === 'dark') classes.push('dark');
        if (headless) classes.push('headless');
        if (isColResizing) classes.push('is-col-resizing');
        if (colResizable) classes.push('col-resizable');
        if (bordered) {
            classes.push('bordered');
            if (typeof bordered === 'string') classes.push(`bordered-${bordered}`);
        }
        if (stripe) classes.push('stripe');
        if (cellHover) classes.push('cell-hover');
        if (cellActive) classes.push('cell-active');
        if (rowHover) classes.push('row-hover');
        if (rowActiveProp.enabled) classes.push('row-active');
        if (showOverflow) classes.push('text-overflow');
        if (showHeaderOverflow) classes.push('header-text-overflow');
        if (isRelativeMode) classes.push('fixed-relative-mode');
        if (autoRowHeight) classes.push('auto-row-height');
        if (isSRBRActive) classes.push('scroll-row-by-row');
        if (scrollbarOptions.enabled) classes.push('scrollbar-on');
        if (areaSelectionConfig.enabled) classes.push('area-selection');
        if (isAreaSelecting) classes.push('is-area-selecting');
        if (isExperimentalScrollY) classes.push('exp-scroll-y');
        if (className) classes.push(className);
        return classes.join(' ');
    }, [
        virtual,
        virtualX,
        virtual_on,
        theme,
        headless,
        isColResizing,
        colResizable,
        bordered,
        stripe,
        cellHover,
        cellActive,
        rowHover,
        rowActiveProp,
        showOverflow,
        showHeaderOverflow,
        isRelativeMode,
        autoRowHeight,
        isSRBRActive,
        scrollbarOptions,
        areaSelectionConfig,
        isAreaSelecting,
        isExperimentalScrollY,
    ]);

    const containerStyle = useMemo(
        () =>
            ({
                '--row-height': autoRowHeight ? undefined : virtualScrollRef.current.rowHeight + 'px',
                '--header-row-height': headerRowHeight + 'px',
                '--footer-row-height': footerRowHeight + 'px',
                '--sb-width': `${scrollbarOptions.width}px`,
                '--sb-height': `${scrollbarOptions.height}px`,
            }) as React.CSSProperties,
        [autoRowHeight, headerRowHeight, footerRowHeight, scrollbarOptions, version],
    );

    const mergedContainerStyle = useMemo(() => ({ ...containerStyle, ...style }), [containerStyle, style]);

    const ctxValue = useMemo<StkTableContextType<DT>>(
        () => ({
            dataSource: dataSourceCopy,
            theme: theme === 'dark' ? 'dark' : 'light',
            setFilter,
        }),
        [dataSourceCopy, theme, setFilter],
    );

    // Render
    return (
        <StkTableContext.Provider value={ctxValue}>
            <div
                ref={tableContainerRef}
                className={containerClass}
                style={mergedContainerStyle}
                tabIndex={areaSelectionConfig.enabled ? 0 : undefined}
                onScroll={onTableScroll}
                onWheel={onTableWheel}
                onKeyDown={onAreaSelectionKeydown}
            >
                {!isExperimentalScrollY && SRBRTotalHeight > 0 && (
                    <div className="row-by-row-table-height" style={{ height: SRBRTotalHeight }}></div>
                )}
                {colResizable && <div ref={colResizeIndicatorRef} className="column-resize-indicator"></div>}

                <div className="stk-table-scroll-container">
                    <table
                        className={`stk-table-main${fixedMode ? ' fixed-mode' : ''}`}
                        style={{ width: width || undefined, minWidth: minWidth || undefined, maxWidth: maxWidth || undefined }}
                        onDragOver={handleTrDragOver}
                        onDragEnter={handleTrDragEnter}
                        onDragEnd={handleTrDragEnd}
                        onClick={handleRowClick}
                        onDoubleClick={handleRowDblclick}
                        onContextMenu={handleRowMenu}
                        onMouseOver={handleTrMouseOver}
                    >
                        {!headless && (
                            <thead>
                                {virtualX_tableHeaders.map((row, rowIndex) => (
                                    <tr key={rowIndex} onContextMenu={e => onHeaderRowMenu?.(e)}>
                                        {virtualX_on && (
                                            <th
                                                className="vt-x-left"
                                                style={{
                                                    minWidth: theadVirtualX.offsetLeft,
                                                    width: theadVirtualX.offsetLeft,
                                                }}
                                            ></th>
                                        )}
                                        {row.map((col, colIndex) => {
                                            const ck = colKeyGen(col);
                                            const sortState = getColumnSortState(ck);
                                            const isSorted = !!sortState && sortState.order !== null;
                                            const thClasses = [
                                                col.sorter ? 'sortable' : '',
                                                isSorted ? 'sorter-' + sortState?.order : '',
                                                col.headerClassName || '',
                                                ...(fixedColClassMap.get(ck) || []),
                                                col.headerAlign === 'left'
                                                    ? 'text-l'
                                                    : col.headerAlign === 'right'
                                                      ? 'text-r'
                                                      : col.headerAlign === 'center'
                                                        ? 'text-c'
                                                        : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ');
                                            return (
                                                <th
                                                    key={ck}
                                                    data-col-key={ck}
                                                    draggable={isHeaderDraggable(col)}
                                                    rowSpan={col.__R_SP__}
                                                    colSpan={col.__C_SP__}
                                                    style={cellStyleMap[TagType.TH].get(ck)}
                                                    title={getHeaderTitle(col)}
                                                    className={thClasses}
                                                    onClick={e => {
                                                        onColumnSort(col);
                                                        onHeaderCellClick?.(e, col);
                                                    }}
                                                    onDragStart={handleThDragStart}
                                                    onDrop={handleThDrop}
                                                    onDragOver={handleThDragOver}
                                                >
                                                    {colResizeOn(col) && colIndex > 0 && (
                                                        <div
                                                            className="table-header-resizer left"
                                                            onMouseDown={e => handleThResizeMouseDown(e, col, true)}
                                                        ></div>
                                                    )}
                                                    <div
                                                        className="table-header-cell-wrapper"
                                                        style={col.__R_SP__ ? ({ '--row-span': col.__R_SP__ } as any) : undefined}
                                                    >
                                                        {col.customHeaderCell ? (
                                                            React.createElement(col.customHeaderCell as any, { col, colIndex, rowIndex })
                                                        ) : renderHeader ? (
                                                            renderHeader(col)
                                                        ) : (
                                                            <span className="table-header-title">{col.title}</span>
                                                        )}
                                                        {col.sorter && <SortIcon className="table-header-sorter" />}
                                                    </div>
                                                    {colResizeOn(col) && (
                                                        <div
                                                            className="table-header-resizer right"
                                                            onMouseDown={e => handleThResizeMouseDown(e, col)}
                                                        ></div>
                                                    )}
                                                </th>
                                            );
                                        })}
                                        {virtualX_on && (
                                            <th className="vt-x-right" style={{ minWidth: virtualX_offsetRight, width: virtualX_offsetRight }}></th>
                                        )}
                                    </tr>
                                ))}
                            </thead>
                        )}

                        {footerData &&
                            footerData.length > 0 &&
                            (isFooterTop ? (
                                <tbody className="stk-footer" style={{ position: 'sticky', top: tableHeaderHeight }}>
                                    {renderFooter()}
                                </tbody>
                            ) : (
                                <tfoot className="stk-footer">{renderFooter()}</tfoot>
                            ))}

                        <tbody
                            className="stk-tbody-main"
                            style={isExperimentalScrollY ? { transform: `translateY(${virtualScrollRef.current.translateY}px)` } : undefined}
                            onClick={handleCellClick}
                            onMouseDown={handleCellMouseDown}
                            onMouseOver={handleCellMouseOver}
                            onMouseOut={handleTbodyMouseOut}
                            onDrop={handleBodyDrop}
                        >
                            {!isExperimentalScrollY && virtual_on && !isSRBRActive && (
                                <tr style={{ height: virtualScrollRef.current.offsetTop }} className="padding-top-tr">
                                    {fixedMode && headless && (
                                        <>
                                            {virtualX_on && (
                                                <td
                                                    className="vt-x-left"
                                                    style={{ minWidth: theadVirtualX.offsetLeft, width: theadVirtualX.offsetLeft }}
                                                ></td>
                                            )}
                                            {virtualX_columnPart.map((col, idx) => {
                                                if (col.__VT_C_SP__) {
                                                    return <td key={`spacer-${idx}`} className="vt-x-spacer" colSpan={col.__VT_C_SP__}></td>;
                                                }
                                                return <td key={idx} style={cellStyleMap[TagType.TD].get(colKeyGen(col))}></td>;
                                            })}
                                            {virtualX_on && (
                                                <td
                                                    className="vt-x-right"
                                                    style={{ minWidth: virtualX_offsetRight, width: virtualX_offsetRight }}
                                                ></td>
                                            )}
                                        </>
                                    )}
                                </tr>
                            )}
                            {virtual_dataSourcePart.map((row, rowIndex) => {
                                const rk = rowKeyGen(row);
                                const absRowIndex = getAbsoluteRowIndex(rowIndex);
                                if (row && row.__EXP_R__) {
                                    return (
                                        <tr key={rk} data-row-key={rk} data-row-i={absRowIndex} className="expanded-row">
                                            <td colSpan={expandRowColspan}>
                                                <div className="table-cell-wrapper" tabIndex={-1}>
                                                    {renderExpand
                                                        ? renderExpand(row.__EXP_R__, row.__EXP_C__)
                                                        : (row.__EXP_R__ && row.__EXP_C__ && row.__EXP_R__[row.__EXP_C__.dataIndex]) || ''}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                                const trClasses = [
                                    rowClassName(row, absRowIndex) || '',
                                    row?.__EXP__ ? 'expanded' : '',
                                    currentRowKey == rk || row === currentRowRef.current ? 'active' : '',
                                    showTrHoverClass && rk === currentHoverRowKey ? 'hover' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ');
                                return (
                                    <tr
                                        key={rk}
                                        ref={el => {
                                            if (el) trRefsMap.current.set(String(rk), el);
                                            else trRefsMap.current.delete(String(rk));
                                        }}
                                        id={stkTableId + '-' + rk}
                                        data-row-key={rk}
                                        data-row-i={absRowIndex}
                                        className={trClasses}
                                    >
                                        {virtualX_on && <td className="vt-x-left"></td>}
                                        {virtualX_columnPart.map((col, _colIdx) => {
                                            if (col.__VT_C_SP__) {
                                                return <td key={`spacer-${_colIdx}`} className="vt-x-spacer" colSpan={col.__VT_C_SP__}></td>;
                                            }
                                            const ck = colKeyGen(col);
                                            // merge cells: 被合并隐藏的单元格不渲染
                                            if (mergeCellsInfo.hiddenCellMap.get(rk)?.has(ck)) return null;
                                            const mergeSpan = mergeCellsInfo.mergeSpanMap.get(pureCellKeyGen(rk, ck));
                                            const cellKey = cellKeyGen(row, col);
                                            const tdClasses = [
                                                col.className || '',
                                                ...(fixedColClassMap.get(ck) || []),
                                                col.align === 'center' ? 'text-c' : col.align === 'right' ? 'text-r' : '',
                                                cellActive && currentSelectedCellKey === cellKey ? 'active' : '',
                                                col.type === 'seq' ? 'seq-column' : '',
                                                col.type === 'expand' && row.__EXP__ && colKeyGen(row.__EXP__) === ck ? 'expanded' : '',
                                                row.__T_EXP__ && col.type === 'tree-node' ? 'tree-expanded' : '',
                                                col.type === 'dragRow' ? 'drag-row-cell' : '',
                                                // 合并单元格：hover/active 行时同步高亮对应的 rowspan 单元格（对齐 stk-table-vue）
                                                col.mergeCells && hoverMergedCellsRef.current.has(cellKey) ? 'cell-hover' : '',
                                                col.mergeCells && activeMergedCells.has(cellKey) ? 'cell-active' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ');
                                            return (
                                                <td
                                                    key={ck}
                                                    data-col-key={ck}
                                                    style={cellStyleMap[TagType.TD].get(ck)}
                                                    className={tdClasses}
                                                    colSpan={mergeSpan?.colspan}
                                                    rowSpan={mergeSpan?.rowspan}
                                                >
                                                    {col.customCell ? (
                                                        React.createElement(col.customCell as any, {
                                                            className: 'table-cell-wrapper',
                                                            tabIndex: -1,
                                                            col,
                                                            row,
                                                            rowIndex: absRowIndex,
                                                            colIndex: (col as any).__LF_S__ ?? 0,
                                                            cellValue: row && row[col.dataIndex],
                                                            expanded: row && row.__EXP__,
                                                            treeExpanded: row && row.__T_EXP__,
                                                        })
                                                    ) : !col.type ? (
                                                        <div className="table-cell-wrapper" tabIndex={-1} title={row[col.dataIndex] || ''}>
                                                            {(row && row[col.dataIndex]) != null ? row[col.dataIndex] : getEmptyCellTextFn(col, row)}
                                                        </div>
                                                    ) : col.type === 'seq' ? (
                                                        <div className="table-cell-wrapper" tabIndex={-1}>
                                                            {(seqConfig.startIndex || 0) + absRowIndex + 1}
                                                        </div>
                                                    ) : col.type === 'tree-node' ? (
                                                        <TreeNodeCell col={col} row={row} onTriangleClick={e => toggleTreeNode(row, col)} />
                                                    ) : (
                                                        <div className="table-cell-wrapper" tabIndex={-1} title={row[col.dataIndex] || ''}>
                                                            {col.type === 'dragRow' && (
                                                                <DragHandle onDragStart={e => handleTrDragStart(e as any, absRowIndex)} />
                                                            )}
                                                            {col.type === 'expand' && <TriangleIcon onClick={e => toggleExpandRow(row, col)} />}
                                                            {row[col.dataIndex] != null && <span>{row[col.dataIndex]}</span>}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        {virtualX_on && <td className="vt-x-right"></td>}
                                    </tr>
                                );
                            })}
                            {!isExperimentalScrollY && (
                                <>
                                    {virtual_on && !isSRBRActive && <tr style={{ height: virtual_offsetBottom }}></tr>}
                                    {SRBRBottomHeight > 0 && <tr style={{ height: SRBRBottomHeight }}></tr>}
                                </>
                            )}
                        </tbody>
                    </table>
                    {scrollbarOptions.enabled && showScrollbar.y && (
                        <div
                            className="stk-sb-thumb vertical"
                            style={{ height: sbThumb.h, transform: `translateY(${sbThumb.t}px)` }}
                            onMouseDown={onVerticalScrollbarMouseDown}
                            onTouchStart={onVerticalScrollbarMouseDown}
                        ></div>
                    )}
                </div>

                {(!dataSourceCopy || !dataSourceCopy.length) && showNoData && (
                    <div className={`stk-table-no-data${noDataFull ? ' no-data-full' : ''}`}>{renderEmpty ? renderEmpty() : '暂无数据'}</div>
                )}
                {renderCustomBottom?.()}
                {scrollbarOptions.enabled && showScrollbar.x && (
                    <div
                        className="stk-sb-thumb horizontal"
                        style={{ width: sbThumb.w, transform: `translateX(${sbThumb.l}px)` }}
                        onMouseDown={onHorizontalScrollbarMouseDown}
                        onTouchStart={onHorizontalScrollbarMouseDown}
                    ></div>
                )}
            </div>
        </StkTableContext.Provider>
    );

    function renderFooter() {
        return footerData.map((footRow, footRowIndex) => (
            <tr key={footRowIndex}>
                {virtualX_on && (
                    <td
                        className="vt-x-left"
                        style={{ minWidth: theadVirtualX.offsetLeft, width: theadVirtualX.offsetLeft }}
                    ></td>
                )}
                {virtualX_columnPart.map((col, _colIdx) => {
                    if (col.__VT_C_SP__) {
                        return <td key={`spacer-${_colIdx}`} className="vt-x-spacer" colSpan={col.__VT_C_SP__}></td>;
                    }
                    const ck = colKeyGen(col);
                    return (
                        <td
                            key={ck}
                            data-col-key={ck}
                            style={cellStyleMap[TagType.TF].get(ck)}
                            className={[
                                col.className,
                                ...(fixedColClassMap.get(ck) || []),
                                col.type === 'seq' ? 'seq-column' : '',
                                col.align === 'center' ? 'text-c' : col.align === 'right' ? 'text-r' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {col.customFooterCell ? (
                                React.createElement(col.customFooterCell as any, {
                                    className: 'table-cell-wrapper',
                                    tabIndex: -1,
                                    col,
                                    row: footRow,
                                    rowIndex: footRowIndex,
                                    cellValue: footRow[col.dataIndex],
                                })
                            ) : (
                                <div className="table-cell-wrapper" tabIndex={-1} title={footRow[col.dataIndex] || ''}>
                                    {footRow[col.dataIndex] != null && <span>{footRow[col.dataIndex]}</span>}
                                </div>
                            )}
                        </td>
                    );
                })}
                {virtualX_on && <td className="vt-x-right" style={{ minWidth: virtualX_offsetRight, width: virtualX_offsetRight }}></td>}
            </tr>
        ));
    }
});

StkTable.displayName = 'StkTable';

export default StkTable;
