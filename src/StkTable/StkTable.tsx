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
    getClosestColKey,
    getClosestTd,
    getClosestTr,
    getClosestTrIndex,
    tableSort,
    transformWidthToStr,
} from './utils';
import { useTableColumns } from './hooks/useTableColumns';
import { StkTableContext } from './context';
import type { StkTableContextType } from './context';

type DT = any & PrivateRowDT;

const SORT_SWITCH_ORDER: Order[] = [null, 'desc', 'asc'];

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
    const isWheelingRef = useRef(false);
    const wheelingTimerRef = useRef(0);
    const scrollRAFScheduledRef = useRef(false);

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

    const tableHeaders = useMemo(() => tableHeadersRef.current, [version]);

    const isTreeData = useMemo(() => columns.some(col => col.type === 'tree-node'), [columns]);

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

    const virtual_offsetBottom = useMemo(() => {
        if (!virtual_on) return 0;
        const { startIndex } = virtualScrollRef.current;
        const rh = virtualScrollRef.current.rowHeight;
        return (dataSourceCopy.length - startIndex - virtual_dataSourcePart.length) * rh;
    }, [virtual_on, dataSourceCopy, virtual_dataSourcePart, version]);

    const virtualX_on = useMemo(() => {
        if (!virtualX) return false;
        const totalWidth = tableHeaderLast.reduce((sum, col) => sum + getCalculatedColWidth(col), 0);
        return totalWidth > virtualScrollXRef.current.containerWidth + 100;
    }, [virtualX, tableHeaderLast, version]);

    const virtualX_offsetRight = useMemo(() => {
        if (!virtualX_on) return 0;
        const endIndex = virtualScrollXRef.current.endIndex;
        let w = 0;
        for (let i = endIndex; i < tableHeaderLast.length; i++) {
            const col = tableHeaderLast[i];
            if (col.fixed !== 'right') w += getCalculatedColWidth(col);
        }
        return w;
    }, [virtualX_on, tableHeaderLast, version]);

    const virtualX_columnPart = useMemo(() => {
        if (virtualX_on) {
            const { startIndex, endIndex } = virtualScrollXRef.current;
            const maxIndex = tableHeaderLast.length;
            const validEndIndex = Math.min(endIndex, maxIndex);
            const validStartIndex = Math.min(startIndex, maxIndex);
            const leftCols: PrivateStkTableColumn<DT>[] = [];
            const rightCols: PrivateStkTableColumn<DT>[] = [];
            for (let i = 0; i < validStartIndex; i++) {
                const col = tableHeaderLast[i];
                if (col?.fixed === 'left') leftCols.push(col);
            }
            for (let i = validEndIndex; i < tableHeaderLast.length; i++) {
                const col = tableHeaderLast[i];
                if (col?.fixed === 'right') rightCols.push(col);
            }
            const mainColumns = tableHeaderLast.slice(validStartIndex, validEndIndex);
            return leftCols.concat(mainColumns).concat(rightCols);
        }
        return tableHeaderLast;
    }, [virtualX_on, tableHeaderLast, version]);

    const expandRowColspan = useMemo(() => {
        if (!virtualX_on) return tableHeaderLast.length;
        return 2 + virtualX_columnPart.length;
    }, [virtualX_on, virtualX_columnPart, tableHeaderLast]);

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

    // Fixed col class map
    const fixedColClassMap = useMemo(() => {
        const colMap = new Map();
        const headers = tableHeadersRef.current;
        for (let i = 0; i < headers.length; i++) {
            const cols = headers[i];
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                const fixed = col.fixed;
                const classList: string[] = [];
                if (fixed) {
                    classList.push('fixed-cell');
                    classList.push('fixed-cell--' + fixed);
                    classList.push('fixed-cell--active');
                }
                colMap.set(colKeyGen(col), classList);
            }
        }
        return colMap;
    }, [version, colKeyGen]);

    // Sort functions
    const getColumnSortState = useCallback(
        (colKeyVal: UniqKey): SortState<DT> | undefined => {
            return sortStates.find(s => s.key === colKeyVal || s.dataIndex === colKeyVal);
        },
        [sortStates],
    );

    const sortData = useCallback(
        (data: DT[]): DT[] => {
            if (!sortStates.length) return data;
            const sc = { ...DEFAULT_SORT_CONFIG, ...sortConfig };
            let result = data.slice();
            for (let i = sortStates.length - 1; i >= 0; i--) {
                const state = sortStates[i];
                const col = tableHeaderLast.find(c => (state.key && colKeyGen(c) === state.key) || c.dataIndex === state.dataIndex);
                if (col && state.order) {
                    const colSortConfig = { ...sc, ...col.sortConfig };
                    result = tableSort(col, state.order, result, colSortConfig);
                }
            }
            return result;
        },
        [sortStates, sortConfig, tableHeaderLast, colKeyGen],
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

    // Virtual scroll functions
    const updateVirtualScrollY = useCallback(
        (sTop = 0) => {
            const vs = virtualScrollRef.current;
            const dataLength = dataSourceCopy.length;
            const rh = vs.rowHeight;
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

            let startIndex = Math.floor(sTop / rh);
            let endIndex = startIndex + vs.pageSize;

            // maxRowSpan correction
            if (maxRowSpanRef.current.size) {
                let correctedStartIndex = startIndex;
                let correctedEndIndex = endIndex;
                for (let i = 0; i < startIndex; i++) {
                    const row = dataSourceCopy[i];
                    if (!row) continue;
                    const spanEndIndex = i + (maxRowSpanRef.current.get(rowKeyGen(row)) || 1);
                    if (spanEndIndex > startIndex) {
                        correctedStartIndex = i;
                        if (spanEndIndex > endIndex) correctedEndIndex = spanEndIndex;
                        break;
                    }
                }
                for (let i = correctedStartIndex; i < endIndex; i++) {
                    const row = dataSourceCopy[i];
                    if (!row) continue;
                    const spanEndIndex = i + (maxRowSpanRef.current.get(rowKeyGen(row)) || 1);
                    if (spanEndIndex > correctedEndIndex) correctedEndIndex = Math.max(spanEndIndex, correctedEndIndex);
                }
                startIndex = correctedStartIndex;
                endIndex = correctedEndIndex;
            }

            if (stripe && startIndex > 0 && startIndex % 2) {
                startIndex -= 1;
            }

            startIndex = Math.max(0, startIndex);
            endIndex = Math.min(endIndex, dataLength);
            if (startIndex >= endIndex) startIndex = endIndex - vs.pageSize;

            const offsetTop = startIndex * rh;
            Object.assign(vs, { startIndex, endIndex, offsetTop });
        },
        [dataSourceCopy, virtual_on, tableHeaderHeight, scrollbarOptions, isExperimentalScrollY, scrollRowByRow, stripe, rowKeyGen],
    );

    const updateVirtualScrollX = useCallback(
        (sLeft = 0) => {
            if (!virtualX) return;
            const headerLength = tableHeaderLast.length;
            if (!headerLength) return;
            const vsx = virtualScrollXRef.current;
            const { containerWidth } = vsx;

            let startIndex = 0;
            let offsetLeft = 0;
            let cumWidth = 0;

            for (let i = 0; i < headerLength; i++) {
                const colW = getCalculatedColWidth(tableHeaderLast[i]);
                if (cumWidth + colW > sLeft) {
                    startIndex = i;
                    offsetLeft = cumWidth;
                    break;
                }
                cumWidth += colW;
            }

            let endIndex = headerLength;
            let endColWidthSum = cumWidth + getCalculatedColWidth(tableHeaderLast[startIndex]) - sLeft;
            for (let i = startIndex + 1; i < headerLength; i++) {
                endColWidthSum += getCalculatedColWidth(tableHeaderLast[i]);
                if (endColWidthSum >= containerWidth) {
                    endIndex = i + 1;
                    break;
                }
            }
            endIndex = Math.min(endIndex, headerLength);
            Object.assign(vsx, { startIndex, endIndex, offsetLeft, scrollLeft: sLeft });
        },
        [virtualX, tableHeaderLast],
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
            const maxScrollTop = Math.max(0, dataSourceCopy.length * rh + tableHeaderHeight - containerHeight);
            if (scrollTop > maxScrollTop) scrollTop = maxScrollTop;
            Object.assign(virtualScrollRef.current, { containerHeight, pageSize, scrollHeight, rowHeight: rh });
            updateVirtualScrollY(scrollTop);
            setVersion(v => v + 1);
        },
        [rowHeight, headless, tableHeaderHeight, dataSourceCopy, isExperimentalScrollY, updateVirtualScrollY],
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
                    setVersion(v => v + 1);
                }
                if (isYScroll) {
                    const { startIndex, endIndex } = virtualScrollRef.current;
                    onScroll?.(e.nativeEvent, { startIndex, endIndex });
                }
                if (isXScroll) {
                    onScrollX?.(e.nativeEvent);
                }
            });
        },
        [isExperimentalScrollY, virtualX_on, updateVirtualScrollY, updateVirtualScrollX, onScroll, onScrollX],
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
        [smoothScroll, isColResizing, virtual_on, virtualX_on, isExperimentalScrollY, updateVirtualScrollY],
    );

    // Sort handler
    const onColumnSort = useCallback(
        (col: StkTableColumn<DT>) => {
            if (!col?.sorter) return;
            const sc: SortConfig<DT> = { ...DEFAULT_SORT_CONFIG, ...sortConfig, ...col.sortConfig };
            const colKeyVal = colKeyGen(col);
            const existingIndex = sortStates.findIndex(s => s.key === colKeyVal || s.dataIndex === colKeyVal);
            let newOrder: Order;

            if (existingIndex >= 0) {
                const currentOrder = sortStates[existingIndex].order;
                const currentIndex = SORT_SWITCH_ORDER.indexOf(currentOrder);
                newOrder = SORT_SWITCH_ORDER[(currentIndex + 1) % 3];
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
            }
        },
        [dataSourceCopy, tableHeaderLast, colKeyGen, showTrHoverClass, onCellMouseleave],
    );

    const handleCellMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const rowIndex = getClosestTrIndex(e.target as HTMLElement) || 0;
            const row = dataSourceCopy[rowIndex];
            const colKeyVal = getClosestColKey(e.target as HTMLElement);
            const col = tableHeaderLast.find(item => colKeyGen(item) === colKeyVal) as any;
            onCellMousedown?.(e, row, col, { rowIndex });
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
            if (showTrHoverClass) {
                setCurrentHoverRowKey((tr as HTMLElement).dataset.rowKey || null);
            }
        },
        [dataSourceCopy, showTrHoverClass],
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
    const setHighlightDimRow = useCallback(
        (rowKeyValues: UniqKey[], option: any = {}) => {
            if (!Array.isArray(rowKeyValues)) rowKeyValues = [rowKeyValues];
            const duration = highlightConfig.duration ? highlightConfig.duration * 1000 : 2000;
            const keyframe: PropertyIndexedKeyframes = { backgroundColor: [theme === 'dark' ? '#1e4c99' : '#71a2fd', ''] };
            for (const rowKeyValue of rowKeyValues) {
                const rowEl = document.getElementById(stkTableId + '-' + String(rowKeyValue));
                if (rowEl) rowEl.animate(keyframe, duration);
            }
        },
        [highlightConfig, theme, stkTableId],
    );

    const setHighlightDimCell = useCallback(
        (rowKeyValue: UniqKey, colKeyValue: string, option: any = {}) => {
            const cellEl = tableContainerRef.current?.querySelector<HTMLElement>(`[data-row-key="${rowKeyValue}"] [data-col-key="${colKeyValue}"]`);
            if (!cellEl) return;
            const duration = highlightConfig.duration ? highlightConfig.duration * 1000 : 2000;
            const keyframe: PropertyIndexedKeyframes = { backgroundColor: [theme === 'dark' ? '#1e4c99' : '#71a2fd', ''] };
            cellEl.animate(keyframe, duration);
        },
        [highlightConfig, theme],
    );

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
            if (order) {
                const column = tableHeaderLast.find(it => colKeyGen(it) === colKeyVal);
                if (column) {
                    const newState: SortState<DT> = {
                        key: colKeyVal,
                        dataIndex: column.dataIndex,
                        sortField: column.sortField,
                        sortType: column.sortType,
                        order,
                    };
                    setSortStates([newState]);
                }
            } else {
                setSortStates([]);
            }
            if (sort && dataSource.length) {
                if (!sortRemote || option.force) {
                    initDataSource(dataSource, { forceSort: option.force });
                }
            }
            return dataSourceCopy;
        },
        [tableHeaderLast, colKeyGen, dataSource, sortRemote, initDataSource, dataSourceCopy],
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

    useEffect(() => {
        dealColumns(columns);
        setVersion(v => v + 1);
        requestAnimationFrame(() => {
            initVirtualScrollX();
        });
    }, [columns]);

    useEffect(() => {
        requestAnimationFrame(() => {
            initVirtualScroll();
            // Deal default sorter
            if (sortConfig.defaultSort) {
                const { key, dataIndex, order, silent } = { silent: true, ...sortConfig.defaultSort };
                setSorter((key || dataIndex) as string, order, { force: false, silent });
            }
        });
    }, []);

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
            getSelectedArea: () => ({ rows: [], cols: [], ranges: [] }),
            setAreaSelection: () => {},
            clearSelectedArea: () => {},
            copySelectedArea: () => '',
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
        if (scrollbarOptions.enabled) classes.push('scrollbar-on');
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
        scrollbarOptions,
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
            <div ref={tableContainerRef} className={containerClass} style={mergedContainerStyle} onScroll={onTableScroll} onWheel={onTableWheel}>
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
                                {tableHeaders.map((row, rowIndex) => (
                                    <tr key={rowIndex} onContextMenu={e => onHeaderRowMenu?.(e)}>
                                        {virtualX_on && (
                                            <th
                                                className="vt-x-left"
                                                style={{
                                                    minWidth: virtualScrollXRef.current.offsetLeft,
                                                    width: virtualScrollXRef.current.offsetLeft,
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
                            {virtual_on && (
                                <tr style={{ height: virtualScrollRef.current.offsetTop }} className="padding-top-tr">
                                    {fixedMode &&
                                        headless &&
                                        virtualX_columnPart.map((col, idx) => (
                                            <td key={idx} style={cellStyleMap[TagType.TD].get(colKeyGen(col))}></td>
                                        ))}
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
                                    <tr key={rk} id={stkTableId + '-' + rk} data-row-key={rk} data-row-i={absRowIndex} className={trClasses}>
                                        {virtualX_on && <td className="vt-x-left"></td>}
                                        {virtualX_columnPart.map((col, _colIdx) => {
                                            if (col.__VT_C_SP__) {
                                                return <td key={`spacer-${_colIdx}`} className="vt-x-spacer" colSpan={col.__VT_C_SP__}></td>;
                                            }
                                            const ck = colKeyGen(col);
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
                                            ]
                                                .filter(Boolean)
                                                .join(' ');
                                            return (
                                                <td key={ck} data-col-key={ck} style={cellStyleMap[TagType.TD].get(ck)} className={tdClasses}>
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
                            {virtual_on && <tr style={{ height: virtual_offsetBottom }}></tr>}
                        </tbody>
                    </table>
                </div>

                {(!dataSourceCopy || !dataSourceCopy.length) && showNoData && (
                    <div className={`stk-table-no-data${noDataFull ? ' no-data-full' : ''}`}>{renderEmpty ? renderEmpty() : '暂无数据'}</div>
                )}
                {renderCustomBottom?.()}
            </div>
        </StkTableContext.Provider>
    );

    function renderFooter() {
        return footerData.map((footRow, footRowIndex) => (
            <tr key={footRowIndex}>
                {virtualX_on && (
                    <td
                        className="vt-x-left"
                        style={{ minWidth: virtualScrollXRef.current.offsetLeft, width: virtualScrollXRef.current.offsetLeft }}
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
