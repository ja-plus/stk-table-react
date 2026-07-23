/**
 * name: stk-table-react
 * version: v1.0.0
 * description: High performance realtime virtual table for React
 * author: japlus
 * homepage: https://ja-plus.github.io/stk-table-react/
 * license: MIT
 */
import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
//#region src/StkTable/components/index.tsx
var SortIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", {
	className,
	xmlns: "http://www.w3.org/2000/svg",
	width: "16px",
	height: "16px",
	viewBox: "0 0 16 16",
	children: [/* @__PURE__ */ jsx("polygon", {
		className: "arrow-up",
		fill: "#757699",
		points: "8 2 4.8 6 11.2 6"
	}), /* @__PURE__ */ jsx("polygon", {
		className: "arrow-down",
		transform: "translate(8, 12) rotate(-180) translate(-8, -12) ",
		points: "8 10 4.8 14 11.2 14"
	})]
});
var TriangleIcon = ({ onClick }) => /* @__PURE__ */ jsx("div", {
	className: "stk-fold-icon",
	onClick: (e) => {
		e.stopPropagation();
		onClick === null || onClick === void 0 || onClick(e);
	}
});
var DragHandle = ({ onDragStart }) => /* @__PURE__ */ jsx("span", {
	className: "drag-row-handle",
	draggable: "true",
	onDragStart,
	children: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 1024 1024",
		width: "20",
		height: "20",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M640 853.3a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m-256 0a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m256-256a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m-256 0a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z m256-256a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3zM384 341.3a85.3 85.3 0 1 1 85.3-85.3 85.3 85.3 0 0 1-85.3 85.3z" })
	})
});
var TreeNodeCell = ({ col, row, onTriangleClick }) => /* @__PURE__ */ jsxs("div", {
	title: row[col.dataIndex] || "",
	style: row.__T_LV__ ? { paddingLeft: `${row.__T_LV__ * 16}px` } : void 0,
	children: [row.children !== void 0 && /* @__PURE__ */ jsx(TriangleIcon, { onClick: onTriangleClick }), /* @__PURE__ */ jsx("span", {
		style: !row.children ? { paddingLeft: "16px" } : void 0,
		children: row[col.dataIndex] ?? ""
	})]
});
//#endregion
//#region src/StkTable/utils/index.ts
/** 是否空值 */
function isEmptyValue(val, isNumber) {
	let isEmpty = val === null || val === void 0;
	if (isNumber) isEmpty = isEmpty || typeof val === "boolean" || Number.isNaN(+val);
	return isEmpty;
}
/**
* 对有序数组插入新数据
*/
function insertToOrderedArray(sortState, newItem, targetArray, sortConfig = {}) {
	const { dataIndex, sortField, order } = sortState;
	let { sortType } = sortState;
	const field = sortField || dataIndex;
	if (!sortType) sortType = typeof newItem[field];
	const isNumber = sortType === "number";
	const data = targetArray.slice();
	if (!order || !data.length) {
		data.unshift(newItem);
		return data;
	}
	const { emptyToBottom, customCompare, stringLocaleCompare } = {
		emptyToBottom: false,
		...sortConfig
	};
	const targetVal = newItem[field];
	if (emptyToBottom && isEmptyValue(targetVal, isNumber)) data.push(newItem);
	else {
		const isAsc = order === "asc";
		const customCompareFn = customCompare || ((a, b) => {
			const midVal = a[field];
			const compareRes = strCompare(midVal, targetVal, isNumber, stringLocaleCompare);
			return isAsc ? compareRes : -compareRes;
		});
		const sIndex = binarySearch(data, (midIndex) => customCompareFn(data[midIndex], newItem));
		data.splice(sIndex, 0, newItem);
	}
	return data;
}
/**
* 二分查找
*/
function binarySearch(searchArray, compareCallback) {
	let sIndex = 0;
	let eIndex = searchArray.length - 1;
	while (sIndex <= eIndex) {
		const midIndex = Math.floor((sIndex + eIndex) / 2);
		const compareRes = compareCallback(midIndex);
		if (compareRes === 0) {
			sIndex = midIndex;
			break;
		} else if (compareRes < 0) sIndex = midIndex + 1;
		else eIndex = midIndex - 1;
	}
	return sIndex;
}
/**
* 字符串比较
*/
function strCompare(a, b, isNumber, localeCompare = false) {
	let _a = a;
	let _b = b;
	if (isNumber) {
		_a = +a;
		_b = +b;
	} else if (localeCompare) return String(a).localeCompare(b);
	if (_a > _b) return 1;
	else if (_a === _b) return 0;
	else return -1;
}
/**
* 分离出空数据和非空数据成两个数组
*/
function separatedData(sortOption, targetDataSource, isNumber) {
	const emptyArr = [];
	const valueArr = [];
	const sortField = sortOption.sortField || sortOption.dataIndex;
	for (let i = 0, len = targetDataSource.length; i < len; i++) {
		const row = targetDataSource[i];
		if (isEmptyValue(row === null || row === void 0 ? void 0 : row[sortField], isNumber)) emptyArr.push(row);
		else valueArr.push(row);
	}
	return [valueArr, emptyArr];
}
/**
* 表格排序
*/
function tableSort(sortOption, order, dataSource, sortConfig = {}) {
	if (!(dataSource === null || dataSource === void 0 ? void 0 : dataSource.length) || !sortOption) return dataSource || [];
	sortConfig = {
		...DEFAULT_SORT_CONFIG,
		...sortConfig
	};
	let targetDataSource = dataSource.slice();
	let sortField = sortOption.sortField || sortOption.dataIndex;
	const { defaultSort, stringLocaleCompare, emptyToBottom, sortChildren } = sortConfig;
	if (!order && defaultSort) {
		order = defaultSort.order;
		sortField = defaultSort.dataIndex;
	}
	if (typeof sortOption.sorter === "function") {
		const customSorterData = sortOption.sorter(targetDataSource, {
			order,
			column: sortOption
		});
		if (customSorterData) targetDataSource = customSorterData;
		if (sortChildren) targetDataSource.forEach((item) => {
			var _item$children;
			if (!((_item$children = item.children) === null || _item$children === void 0 ? void 0 : _item$children.length)) return;
			item.children = tableSort(sortOption, order, item.children, sortConfig);
		});
	} else if (order) {
		let { sortType } = sortOption;
		if (!sortType) sortType = typeof dataSource[0][sortField];
		const isNumber = sortType === "number";
		const [valueArr, emptyArr] = separatedData(sortOption, targetDataSource, isNumber);
		if (order === "asc") valueArr.sort((a, b) => strCompare(a[sortField], b[sortField], isNumber, stringLocaleCompare));
		else valueArr.sort((a, b) => strCompare(b[sortField], a[sortField], isNumber, stringLocaleCompare));
		targetDataSource = order === "desc" || emptyToBottom ? valueArr.concat(emptyArr) : emptyArr.concat(valueArr);
		if (sortChildren) targetDataSource.forEach((item) => {
			var _item$children2;
			if (!((_item$children2 = item.children) === null || _item$children2 === void 0 ? void 0 : _item$children2.length)) return;
			item.children = tableSort(sortOption, order, item.children, sortConfig);
		});
	}
	return targetDataSource;
}
/** 多级表头深度 */
function howDeepTheHeader(arr, level = 0) {
	const levels = [level];
	arr.forEach((item) => {
		var _item$children3;
		if ((_item$children3 = item.children) === null || _item$children3 === void 0 ? void 0 : _item$children3.length) levels.push(howDeepTheHeader(item.children, level + 1));
	});
	return Math.max(...levels);
}
/** number width +px */
function transformWidthToStr(width) {
	if (width === void 0) return;
	const numberWidth = Number(width);
	return width + (!Number.isNaN(numberWidth) ? "px" : "");
}
function getBrowsersVersion(browserName) {
	try {
		const reg = new RegExp(`${browserName}/\\d+`, "i");
		const userAgent = navigator.userAgent.match(reg);
		if (userAgent) return +userAgent[0].split("/")[1];
	} catch (e) {}
	return 100;
}
function getClosestTr(target) {
	return target === null || target === void 0 ? void 0 : target.closest("tr");
}
function getClosestTd(target) {
	return target === null || target === void 0 ? void 0 : target.closest("td");
}
function getClosestTrIndex(target) {
	const tr = getClosestTr(target);
	if (!tr) return -1;
	return Number(tr.dataset.rowI);
}
function getClosestColKey(target) {
	var _getClosestTd;
	return (_getClosestTd = getClosestTd(target)) === null || _getClosestTd === void 0 ? void 0 : _getClosestTd.dataset.colKey;
}
//#endregion
//#region src/StkTable/const.ts
var DEFAULT_COL_WIDTH = 100;
var DEFAULT_TABLE_HEIGHT = 100;
var DEFAULT_TABLE_WIDTH = 200;
var DEFAULT_ROW_HEIGHT = 28;
/** highlight background */
var HIGHLIGHT_COLOR = {
	light: {
		from: "#71a2fd",
		to: "#fff"
	},
	dark: {
		from: "#1e4c99",
		to: "#181c21"
	}
};
var HIGHLIGHT_DURATION = 2e3;
var HIGHLIGHT_ROW_CLASS = "highlight-row";
var HIGHLIGHT_CELL_CLASS = "highlight-cell";
var _chromeVersion = getBrowsersVersion("chrome");
var _firefoxVersion = getBrowsersVersion("firefox");
/** legacy sticky compatible mode */
var IS_LEGACY_MODE = _chromeVersion < 56 || _firefoxVersion < 59;
/** default props.smoothDefault */
var DEFAULT_SMOOTH_SCROLL = _chromeVersion < 85;
var STK_ID_PREFIX = "stk";
/** expanded row key prefix */
var EXPANDED_ROW_KEY_PREFIX = "expanded-";
/** cell key split str */
var CELL_KEY_SEPARATE = "--";
var DEFAULT_SORT_CONFIG = {
	emptyToBottom: false,
	stringLocaleCompare: false,
	sortChildren: false
};
var DEFAULT_ROW_ACTIVE_CONFIG = {
	enabled: true,
	disabled: () => false,
	revokable: true
};
//#endregion
//#region src/StkTable/types/index.ts
/** th td type */
var TagType = {
	TH: 0,
	TD: 1,
	TF: 2
};
//#endregion
//#region src/StkTable/utils/constRefUtils.ts
/**
* 获取列宽
*/
function getColWidth(col) {
	const val = col.minWidth ?? col.width ?? 100;
	if (typeof val === "number") return Math.floor(val);
	return parseInt(val);
}
/** 获取计算后的宽度 */
function getCalculatedColWidth(col) {
	return (col === null || col === void 0 ? void 0 : col.__W__) || 100;
}
/** 创建组件唯一标识 */
function createStkTableId() {
	let id = window.__STK_TB_ID_COUNT__;
	if (!id) id = 0;
	id += 1;
	window.__STK_TB_ID_COUNT__ = id;
	return "stk" + id.toString(36);
}
//#endregion
//#region src/StkTable/hooks/useTableColumns.ts
/**
* Table Columns Processing Hook (React)
* Handles multi-level header processing and column flattening
*/
function useTableColumns(isRelativeMode) {
	const tableHeadersRef = useRef([]);
	const tableHeadersForCalcRef = useRef([]);
	return {
		tableHeadersRef,
		tableHeadersForCalcRef,
		dealColumns: useCallback((columns) => {
			const tableHeadersTemp = [];
			const tableHeadersForCalcTemp = [];
			let copyColumn = columns;
			if (isRelativeMode) {
				const leftCol = [];
				const centerCol = [];
				const rightCol = [];
				for (let i = 0, len = copyColumn.length; i < len; i++) {
					const col = copyColumn[i];
					if (col.fixed === "left") leftCol.push(col);
					else if (col.fixed === "right") rightCol.push(col);
					else centerCol.push(col);
				}
				copyColumn = leftCol.concat(centerCol).concat(rightCol);
			}
			const maxDeep = howDeepTheHeader(copyColumn);
			for (let i = 0; i <= maxDeep; i++) {
				tableHeadersTemp[i] = [];
				tableHeadersForCalcTemp[i] = [];
			}
			let leafIndex = 0;
			function flat(arr, parent, depth = 0) {
				let allChildrenLen = 0;
				let allChildrenWidthSum = 0;
				for (let i = 0, len = arr.length; i < len; i++) {
					const col = arr[i];
					if (col.hidden) continue;
					col.__P__ = parent;
					col.__LF_S__ = leafIndex;
					let colChildrenLen = 1;
					let colWidth = 0;
					if (col.children) {
						const [len, widthSum] = flat(col.children, col, depth + 1);
						colChildrenLen = len;
						colWidth = widthSum;
						tableHeadersForCalcTemp[depth].push(col);
					} else {
						colWidth = getColWidth(col);
						leafIndex++;
						for (let j = depth; j <= maxDeep; j++) tableHeadersForCalcTemp[j].push(col);
					}
					col.__LF_E__ = leafIndex;
					col.__W__ = colWidth;
					tableHeadersTemp[depth].push(col);
					const rowSpan = col.children ? 1 : maxDeep - depth + 1;
					const colSpan = colChildrenLen;
					if (rowSpan > 1) col.__R_SP__ = rowSpan;
					if (colSpan > 1) col.__C_SP__ = colSpan;
					allChildrenLen += colChildrenLen;
					allChildrenWidthSum += colWidth;
				}
				return [allChildrenLen, allChildrenWidthSum];
			}
			flat(copyColumn, null);
			tableHeadersRef.current = tableHeadersTemp;
			tableHeadersForCalcRef.current = tableHeadersForCalcTemp;
		}, [isRelativeMode])
	};
}
//#endregion
//#region src/StkTable/context.ts
var StkTableContext = createContext(null);
//#endregion
//#region src/StkTable/StkTable.tsx
var SORT_SWITCH_ORDER = [
	null,
	"desc",
	"asc"
];
/**
* StkTable React Component
* A high-performance virtual scrolling table
*/
var StkTable = forwardRef((props, ref) => {
	const { width = "", minWidth = "", maxWidth = "", stripe = false, fixedMode = false, headless = false, theme = "light", rowHeight = 28, autoRowHeight = false, rowHover = true, rowActive = DEFAULT_ROW_ACTIVE_CONFIG, rowCurrentRevokable = true, headerRowHeight = 28, footerRowHeight = 28, virtual = false, virtualX = false, columns = [], dataSource = [], rowKey = "", colKey, emptyCellText = "--", noDataFull = false, showNoData = true, sortRemote = false, showHeaderOverflow = false, showOverflow = false, showTrHoverClass = false, cellHover = false, cellActive = false, selectedCellRevokable = true, areaSelection = false, headerDrag = false, rowClassName = () => "", colResizable = false, colMinWidth = 10, bordered = true, autoResize = true, fixedColShadow = false, sortConfig = DEFAULT_SORT_CONFIG, hideHeaderTitle = false, highlightConfig = {}, seqConfig = {}, expandConfig = {}, dragRowConfig = {}, treeConfig = {}, cellFixedMode = "sticky", smoothScroll = DEFAULT_SMOOTH_SCROLL, scrollRowByRow = false, scrollbar = false, experimental = {}, footerData = [], footerConfig = { position: "bottom" }, renderHeader, renderEmpty, renderExpand, renderCustomBottom, onSortChange, onRowClick, onCurrentChange, onCellSelected, onRowDblclick, onHeaderRowMenu, onRowMenu, onCellClick, onCellMouseenter, onCellMouseleave, onCellMouseover, onCellMousedown, onHeaderCellClick, onScroll, onScrollX, onColOrderChange, onThDragStart: onThDragStartCb, onThDrop: onThDropCb, onRowOrderChange, onColResize, onToggleRowExpand, onToggleTreeExpand, onAreaSelectionChange, onFilterChange, onUpdateColumns, className = "", style } = props;
	const stkTableId = useMemo(() => createStkTableId(), []);
	const tableContainerRef = useRef(null);
	const colResizeIndicatorRef = useRef(null);
	useRef(/* @__PURE__ */ new Map());
	const isRelativeMode = IS_LEGACY_MODE ? true : cellFixedMode === "relative";
	const [dataSourceCopy, setDataSourceCopy] = useState([]);
	const [currentRowKey, setCurrentRowKey] = useState();
	const [currentSelectedCellKey, setCurrentSelectedCellKey] = useState();
	const [currentHoverRowKey, setCurrentHoverRowKey] = useState(null);
	const [sortStates, setSortStates] = useState([]);
	const [isColResizing, setIsColResizing] = useState(false);
	const [version, setVersion] = useState(0);
	const virtualScrollRef = useRef({
		containerHeight: 0,
		rowHeight,
		pageSize: 0,
		startIndex: 0,
		endIndex: 0,
		offsetTop: 0,
		scrollTop: 0,
		scrollHeight: 0,
		translateY: 0
	});
	const virtualScrollXRef = useRef({
		containerWidth: 0,
		scrollWidth: 0,
		startIndex: 0,
		endIndex: 0,
		offsetLeft: 0,
		scrollLeft: 0
	});
	const currentRowRef = useRef(void 0);
	const currentHoverRowRef = useRef(null);
	const filterStatusRef = useRef({});
	const rowKeyGenCacheRef = useRef(/* @__PURE__ */ new WeakMap());
	const autoRowHeightMapRef = useRef(/* @__PURE__ */ new Map());
	const maxRowSpanRef = useRef(/* @__PURE__ */ new Map());
	useRef(false);
	useRef(0);
	const scrollRAFScheduledRef = useRef(false);
	const { tableHeadersRef, tableHeadersForCalcRef, dealColumns } = useTableColumns(isRelativeMode);
	const scrollbarOptions = useMemo(() => ({
		enabled: true,
		minHeight: 20,
		minWidth: 20,
		width: 8,
		height: 8,
		...typeof scrollbar === "boolean" ? { enabled: scrollbar } : scrollbar
	}), [scrollbar]);
	const isExperimentalScrollY = useMemo(() => {
		if ((scrollbarOptions === null || scrollbarOptions === void 0 ? void 0 : scrollbarOptions.enabled) && scrollRowByRow) return true;
		return experimental === null || experimental === void 0 ? void 0 : experimental.scrollY;
	}, [
		scrollbarOptions,
		scrollRowByRow,
		experimental
	]);
	const isFooterTop = (footerConfig === null || footerConfig === void 0 ? void 0 : footerConfig.position) === "top";
	const rowActiveProp = useMemo(() => {
		if (typeof rowActive === "boolean") return {
			...DEFAULT_ROW_ACTIVE_CONFIG,
			enabled: rowActive ?? true,
			revokable: Boolean(rowCurrentRevokable)
		};
		return {
			...DEFAULT_ROW_ACTIVE_CONFIG,
			...rowActive
		};
	}, [rowActive, rowCurrentRevokable]);
	const rowKeyGenComputed = useMemo(() => {
		if (typeof rowKey === "function") return (row) => rowKey(row);
		return (row) => row[rowKey];
	}, [rowKey]);
	const colKeyGen = useMemo(() => {
		if (colKey === void 0) return (col) => col.key || col.dataIndex;
		else if (typeof colKey === "function") return (col) => colKey(col);
		return (col) => col[colKey];
	}, [colKey]);
	const getEmptyCellTextFn = useMemo(() => {
		if (typeof emptyCellText === "string") return () => emptyCellText;
		return (col, row) => emptyCellText({
			row,
			col
		});
	}, [emptyCellText]);
	const rowKeyGen = useCallback((row) => {
		if (!row) return row;
		const cache = rowKeyGenCacheRef.current;
		let key = cache.get(row);
		if (key !== void 0) return key;
		const cachedRowKey = row.__R_K__;
		if (cachedRowKey !== void 0) {
			cache.set(row, cachedRowKey);
			return cachedRowKey;
		}
		key = rowKeyGenComputed(row);
		if (key === void 0) key = Math.random().toString(36).slice(2);
		cache.set(row, key);
		return key;
	}, [rowKeyGenComputed]);
	const cellKeyGen = useCallback((row, col) => {
		return rowKeyGen(row) + "--" + colKeyGen(col);
	}, [rowKeyGen, colKeyGen]);
	const tableHeaderLast = useMemo(() => {
		return tableHeadersForCalcRef.current.slice(-1)[0] || [];
	}, [version]);
	const tableHeaders = useMemo(() => tableHeadersRef.current, [version]);
	const isTreeData = useMemo(() => columns.some((col) => col.type === "tree-node"), [columns]);
	const tableHeaderHeight = useMemo(() => {
		return headerRowHeight * (tableHeadersRef.current.length || 1);
	}, [headerRowHeight, version]);
	const virtual_on = useMemo(() => {
		return virtual && dataSourceCopy.length > virtualScrollRef.current.pageSize;
	}, [
		virtual,
		dataSourceCopy,
		version
	]);
	const virtual_dataSourcePart = useMemo(() => {
		if (!virtual_on) return dataSourceCopy;
		const { startIndex, endIndex } = virtualScrollRef.current;
		return dataSourceCopy.slice(startIndex, endIndex + 1);
	}, [
		virtual_on,
		dataSourceCopy,
		version
	]);
	const virtual_offsetBottom = useMemo(() => {
		if (!virtual_on) return 0;
		const { startIndex } = virtualScrollRef.current;
		const rh = virtualScrollRef.current.rowHeight;
		return (dataSourceCopy.length - startIndex - virtual_dataSourcePart.length) * rh;
	}, [
		virtual_on,
		dataSourceCopy,
		virtual_dataSourcePart,
		version
	]);
	const virtualX_on = useMemo(() => {
		if (!virtualX) return false;
		return tableHeaderLast.reduce((sum, col) => sum + getCalculatedColWidth(col), 0) > virtualScrollXRef.current.containerWidth + 100;
	}, [
		virtualX,
		tableHeaderLast,
		version
	]);
	const virtualX_offsetRight = useMemo(() => {
		if (!virtualX_on) return 0;
		const endIndex = virtualScrollXRef.current.endIndex;
		let w = 0;
		for (let i = endIndex; i < tableHeaderLast.length; i++) {
			const col = tableHeaderLast[i];
			if (col.fixed !== "right") w += getCalculatedColWidth(col);
		}
		return w;
	}, [
		virtualX_on,
		tableHeaderLast,
		version
	]);
	const virtualX_columnPart = useMemo(() => {
		if (virtualX_on) {
			const { startIndex, endIndex } = virtualScrollXRef.current;
			const maxIndex = tableHeaderLast.length;
			const validEndIndex = Math.min(endIndex, maxIndex);
			const validStartIndex = Math.min(startIndex, maxIndex);
			const leftCols = [];
			const rightCols = [];
			for (let i = 0; i < validStartIndex; i++) {
				const col = tableHeaderLast[i];
				if ((col === null || col === void 0 ? void 0 : col.fixed) === "left") leftCols.push(col);
			}
			for (let i = validEndIndex; i < tableHeaderLast.length; i++) {
				const col = tableHeaderLast[i];
				if ((col === null || col === void 0 ? void 0 : col.fixed) === "right") rightCols.push(col);
			}
			const mainColumns = tableHeaderLast.slice(validStartIndex, validEndIndex);
			return leftCols.concat(mainColumns).concat(rightCols);
		}
		return tableHeaderLast;
	}, [
		virtualX_on,
		tableHeaderLast,
		version
	]);
	const expandRowColspan = useMemo(() => {
		if (!virtualX_on) return tableHeaderLast.length;
		return 2 + virtualX_columnPart.length;
	}, [
		virtualX_on,
		virtualX_columnPart,
		tableHeaderLast
	]);
	const getFixedColPosition = useMemo(() => {
		const colKeyStore = {};
		const refStore = /* @__PURE__ */ new WeakMap();
		tableHeadersForCalcRef.current.forEach((cols) => {
			let left = 0;
			let rightStartIndex = 0;
			for (let i = 0; i < cols.length; i++) {
				const item = cols[i];
				if (item.fixed === "left") {
					const ck = colKeyGen(item);
					if (ck) colKeyStore[ck] = left;
					else refStore.set(item, left);
					left += getCalculatedColWidth(item);
				}
				if (!rightStartIndex && item.fixed === "right") rightStartIndex = i;
			}
			let right = 0;
			for (let i = cols.length - 1; i >= rightStartIndex; i--) {
				const item = cols[i];
				if (item.fixed === "right") {
					const ck = colKeyGen(item);
					if (ck) colKeyStore[ck] = right;
					else refStore.set(item, right);
					right += getCalculatedColWidth(item);
				}
			}
		});
		return (col) => {
			const ck = colKeyGen(col);
			return ck ? colKeyStore[ck] : refStore.get(col) || 0;
		};
	}, [version, colKeyGen]);
	const getFixedStyle = useCallback((tagType, col, depth = 0) => {
		const { fixed } = col;
		const style = {};
		if ((tagType === TagType.TD || tagType === TagType.TF) && !fixed) return style;
		const isFixedLeft = fixed === "left";
		const { scrollLeft, scrollWidth, offsetLeft, containerWidth } = virtualScrollXRef.current;
		const scrollRight = scrollWidth - containerWidth - scrollLeft;
		if (tagType === TagType.TH) if (!isRelativeMode) {
			if (depth) style.top = `${depth * headerRowHeight}px`;
		} else style.top = `${virtualScrollRef.current.scrollTop}px`;
		else if (tagType === TagType.TF) style.bottom = "0";
		if (fixed) if (!isRelativeMode) {
			const lr = getFixedColPosition(col) + "px";
			if (isFixedLeft) style.left = lr;
			else style.right = lr;
		} else if (isFixedLeft) style.left = `${scrollLeft - (virtualX_on ? offsetLeft : 0)}px`;
		else style.right = `${Math.max(scrollRight - (virtualX_on ? virtualX_offsetRight : 0), 0)}px`;
		return style;
	}, [
		isRelativeMode,
		headerRowHeight,
		getFixedColPosition,
		virtualX_on,
		virtualX_offsetRight
	]);
	const cellStyleMap = useMemo(() => {
		const thMap = /* @__PURE__ */ new Map();
		const tdMap = /* @__PURE__ */ new Map();
		const tfMap = /* @__PURE__ */ new Map();
		const headers = tableHeadersRef.current;
		for (let depth = 0; depth < headers.length; depth++) {
			const cols = headers[depth];
			for (let i = 0; i < cols.length; i++) {
				const col = cols[i];
				const w = virtualX ? getCalculatedColWidth(col) + "px" : transformWidthToStr(col.width);
				const minWidthStr = transformWidthToStr(col.minWidth);
				const maxWidthStr = transformWidthToStr(col.maxWidth);
				const baseStyle = {};
				if (w) baseStyle["--cw"] = w;
				if (minWidthStr) baseStyle.minWidth = minWidthStr;
				if (maxWidthStr) baseStyle.maxWidth = maxWidthStr;
				const ck = colKeyGen(col);
				thMap.set(ck, {
					...baseStyle,
					...getFixedStyle(TagType.TH, col, depth)
				});
				tdMap.set(ck, {
					...baseStyle,
					...getFixedStyle(TagType.TD, col, depth)
				});
				tfMap.set(ck, {
					position: "sticky",
					...baseStyle,
					...getFixedStyle(TagType.TF, col, depth)
				});
			}
		}
		return {
			[TagType.TH]: thMap,
			[TagType.TD]: tdMap,
			[TagType.TF]: tfMap
		};
	}, [
		version,
		virtualX,
		colKeyGen,
		getFixedStyle
	]);
	const fixedColClassMap = useMemo(() => {
		const colMap = /* @__PURE__ */ new Map();
		const headers = tableHeadersRef.current;
		for (let i = 0; i < headers.length; i++) {
			const cols = headers[i];
			for (let j = 0; j < cols.length; j++) {
				const col = cols[j];
				const fixed = col.fixed;
				const classList = [];
				if (fixed) {
					classList.push("fixed-cell");
					classList.push("fixed-cell--" + fixed);
					classList.push("fixed-cell--active");
				}
				colMap.set(colKeyGen(col), classList);
			}
		}
		return colMap;
	}, [version, colKeyGen]);
	const getColumnSortState = useCallback((colKeyVal) => {
		return sortStates.find((s) => s.key === colKeyVal || s.dataIndex === colKeyVal);
	}, [sortStates]);
	const sortData = useCallback((data) => {
		if (!sortStates.length) return data;
		const sc = {
			...DEFAULT_SORT_CONFIG,
			...sortConfig
		};
		let result = data.slice();
		for (let i = sortStates.length - 1; i >= 0; i--) {
			const state = sortStates[i];
			const col = tableHeaderLast.find((c) => state.key && colKeyGen(c) === state.key || c.dataIndex === state.dataIndex);
			if (col && state.order) {
				const colSortConfig = {
					...sc,
					...col.sortConfig
				};
				result = tableSort(col, state.order, result, colSortConfig);
			}
		}
		return result;
	}, [
		sortStates,
		sortConfig,
		tableHeaderLast,
		colKeyGen
	]);
	const flatTreeData = useCallback((data) => {
		const { defaultExpandAll, defaultExpandKeys, defaultExpandLevel } = treeConfig;
		function recursionFlat(items, level) {
			if (!items) return [];
			let result = [];
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				result.push(item);
				if (item.__T_EXP__ === void 0) if (defaultExpandAll) item.__T_EXP__ = true;
				else if (defaultExpandLevel && level < defaultExpandLevel) item.__T_EXP__ = true;
				else if (defaultExpandKeys === null || defaultExpandKeys === void 0 ? void 0 : defaultExpandKeys.includes(rowKeyGen(item))) item.__T_EXP__ = true;
				else item.__T_EXP__ = false;
				item.__T_LV__ = level;
				if (item.__T_EXP__) result = result.concat(recursionFlat(item.children, level + 1));
			}
			return result;
		}
		return recursionFlat(data, 0);
	}, [treeConfig, rowKeyGen]);
	const filterDataSource = useCallback((data) => {
		const filterKeys = Object.keys(filterStatusRef.current);
		if (!(filterKeys === null || filterKeys === void 0 ? void 0 : filterKeys.length)) return data;
		let result = data;
		for (const key of filterKeys) {
			const { value, filter } = filterStatusRef.current[key];
			if (!(value === null || value === void 0 ? void 0 : value.length)) continue;
			result = result.filter((row) => {
				const cellValue = row[key];
				if (filter) return filter({
					row,
					cellValue,
					filterValues: value
				});
				return value.some((v) => cellValue == v);
			});
		}
		return result;
	}, []);
	const initDataSource = useCallback((v = dataSource, option) => {
		let dataSourceTemp = v.slice();
		if (!sortRemote || (option === null || option === void 0 ? void 0 : option.forceSort)) dataSourceTemp = sortData(dataSourceTemp);
		if (isTreeData) dataSourceTemp = flatTreeData(dataSourceTemp);
		dataSourceTemp = filterDataSource(dataSourceTemp);
		setDataSourceCopy(dataSourceTemp);
		return dataSourceTemp;
	}, [
		dataSource,
		sortRemote,
		sortData,
		isTreeData,
		flatTreeData,
		filterDataSource
	]);
	const updateVirtualScrollY = useCallback((sTop = 0) => {
		const vs = virtualScrollRef.current;
		const dataLength = dataSourceCopy.length;
		const rh = vs.rowHeight;
		const scrollHeight = dataLength * rh + tableHeaderHeight;
		if (scrollbarOptions.enabled) {
			vs.scrollHeight = scrollHeight;
			if (isExperimentalScrollY) {
				let maxTop;
				sTop = sTop < 0 ? 0 : sTop < (maxTop = scrollHeight - vs.containerHeight) ? sTop : maxTop;
				vs.translateY = scrollRowByRow ? 0 : -(sTop % rh);
			}
		}
		vs.scrollTop = sTop;
		if (!virtual_on) {
			Object.assign(vs, {
				startIndex: 0,
				endIndex: 0,
				offsetTop: 0
			});
			return;
		}
		let startIndex = Math.floor(sTop / rh);
		let endIndex = startIndex + vs.pageSize;
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
		if (stripe && startIndex > 0 && startIndex % 2) startIndex -= 1;
		startIndex = Math.max(0, startIndex);
		endIndex = Math.min(endIndex, dataLength);
		if (startIndex >= endIndex) startIndex = endIndex - vs.pageSize;
		const offsetTop = startIndex * rh;
		Object.assign(vs, {
			startIndex,
			endIndex,
			offsetTop
		});
	}, [
		dataSourceCopy,
		virtual_on,
		tableHeaderHeight,
		scrollbarOptions,
		isExperimentalScrollY,
		scrollRowByRow,
		stripe,
		rowKeyGen
	]);
	const updateVirtualScrollX = useCallback((sLeft = 0) => {
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
		Object.assign(vsx, {
			startIndex,
			endIndex,
			offsetLeft,
			scrollLeft: sLeft
		});
	}, [virtualX, tableHeaderLast]);
	const initVirtualScrollY = useCallback((height) => {
		const container = tableContainerRef.current;
		const { clientHeight, scrollHeight } = container || {};
		let scrollTop = isExperimentalScrollY ? virtualScrollRef.current.scrollTop : (container === null || container === void 0 ? void 0 : container.scrollTop) || 0;
		const rh = rowHeight;
		const containerHeight = height || clientHeight || 100;
		let pageSize = Math.ceil(containerHeight / rh);
		if (!headless) {
			const headerToBodyRowHeightCount = Math.floor(tableHeaderHeight / rh);
			pageSize -= headerToBodyRowHeightCount;
		}
		const maxScrollTop = Math.max(0, dataSourceCopy.length * rh + tableHeaderHeight - containerHeight);
		if (scrollTop > maxScrollTop) scrollTop = maxScrollTop;
		Object.assign(virtualScrollRef.current, {
			containerHeight,
			pageSize,
			scrollHeight,
			rowHeight: rh
		});
		updateVirtualScrollY(scrollTop);
		setVersion((v) => v + 1);
	}, [
		rowHeight,
		headless,
		tableHeaderHeight,
		dataSourceCopy,
		isExperimentalScrollY,
		updateVirtualScrollY
	]);
	const initVirtualScrollX = useCallback(() => {
		const { clientWidth, scrollLeft, scrollWidth } = tableContainerRef.current || {};
		virtualScrollXRef.current.containerWidth = clientWidth || 200;
		virtualScrollXRef.current.scrollWidth = scrollWidth || 200;
		updateVirtualScrollX(scrollLeft);
		setVersion((v) => v + 1);
	}, [updateVirtualScrollX]);
	const initVirtualScroll = useCallback(() => {
		initVirtualScrollY();
		initVirtualScrollX();
	}, [initVirtualScrollY, initVirtualScrollX]);
	const scrollTo = useCallback((top = 0, left = 0) => {
		const container = tableContainerRef.current;
		if (!container) return;
		if (top !== null) if (isExperimentalScrollY) {
			updateVirtualScrollY(top);
			setVersion((v) => v + 1);
		} else container.scrollTop = top;
		if (left !== null) container.scrollLeft = left;
	}, [isExperimentalScrollY, updateVirtualScrollY]);
	const onTableScroll = useCallback((e) => {
		if (scrollRAFScheduledRef.current) return;
		scrollRAFScheduledRef.current = true;
		requestAnimationFrame(() => {
			scrollRAFScheduledRef.current = false;
			const { scrollTop, scrollLeft } = e.target;
			const { scrollTop: vScrollTop } = virtualScrollRef.current;
			const { scrollLeft: vScrollLeft } = virtualScrollXRef.current;
			const isYScroll = isExperimentalScrollY ? false : scrollTop !== vScrollTop;
			const isXScroll = scrollLeft !== vScrollLeft;
			if (isYScroll) {
				updateVirtualScrollY(scrollTop);
				setVersion((v) => v + 1);
			}
			if (isXScroll) {
				if (virtualX_on) updateVirtualScrollX(scrollLeft);
				else virtualScrollXRef.current.scrollLeft = scrollLeft;
				setVersion((v) => v + 1);
			}
			if (isYScroll) {
				const { startIndex, endIndex } = virtualScrollRef.current;
				onScroll === null || onScroll === void 0 || onScroll(e.nativeEvent, {
					startIndex,
					endIndex
				});
			}
			if (isXScroll) onScrollX === null || onScrollX === void 0 || onScrollX(e.nativeEvent);
		});
	}, [
		isExperimentalScrollY,
		virtualX_on,
		updateVirtualScrollY,
		updateVirtualScrollX,
		onScroll,
		onScrollX
	]);
	const onTableWheel = useCallback((e) => {
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
			if (deltaY > 0 && canScrollDown || deltaY < 0 && scrollTop > 1) e.preventDefault();
			if (isExperimentalScrollY) {
				updateVirtualScrollY(scrollTop + deltaY);
				setVersion((v) => v + 1);
			} else dom.scrollTop += deltaY;
		}
		if (virtualX_on) {
			let distance = deltaX;
			if (shiftKey && deltaY) distance = deltaY;
			dom.scrollLeft += distance;
		}
	}, [
		smoothScroll,
		isColResizing,
		virtual_on,
		virtualX_on,
		isExperimentalScrollY,
		updateVirtualScrollY
	]);
	const onColumnSort = useCallback((col) => {
		if (!(col === null || col === void 0 ? void 0 : col.sorter)) return;
		const sc = {
			...DEFAULT_SORT_CONFIG,
			...sortConfig,
			...col.sortConfig
		};
		const colKeyVal = colKeyGen(col);
		const existingIndex = sortStates.findIndex((s) => s.key === colKeyVal || s.dataIndex === colKeyVal);
		let newOrder;
		if (existingIndex >= 0) {
			const currentOrder = sortStates[existingIndex].order;
			newOrder = SORT_SWITCH_ORDER[(SORT_SWITCH_ORDER.indexOf(currentOrder) + 1) % 3];
		} else newOrder = SORT_SWITCH_ORDER[1];
		let newStates;
		if (newOrder) {
			const newState = {
				key: colKeyVal,
				dataIndex: col.dataIndex,
				sortField: col.sortField,
				sortType: col.sortType,
				order: newOrder
			};
			if (sc.multiSort) newStates = [newState, ...sortStates.filter((s) => s.key !== colKeyVal && s.dataIndex !== colKeyVal)].slice(0, sc.multiSortLimit ?? 3);
			else newStates = [newState];
		} else newStates = sortStates.filter((s) => s.key !== colKeyVal && s.dataIndex !== colKeyVal);
		setSortStates(newStates);
		if (!sortRemote) {
			let data = dataSource.slice();
			for (let i = newStates.length - 1; i >= 0; i--) {
				const state = newStates[i];
				const sortCol = tableHeaderLast.find((c) => state.key && colKeyGen(c) === state.key || c.dataIndex === state.dataIndex);
				if (sortCol && state.order) data = tableSort(sortCol, state.order, data, {
					...DEFAULT_SORT_CONFIG,
					...sortConfig
				});
			}
			if (isTreeData) data = flatTreeData(data);
			data = filterDataSource(data);
			setDataSourceCopy(data);
		}
		onSortChange === null || onSortChange === void 0 || onSortChange(col, newOrder, dataSourceCopy, sc);
	}, [
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
		onSortChange
	]);
	const handleRowClick = useCallback((e) => {
		var _rowActiveProp$disabl;
		const rowIndex = getClosestTrIndex(e.target);
		const row = dataSourceCopy[rowIndex];
		if (!row) return;
		onRowClick === null || onRowClick === void 0 || onRowClick(e, row, { rowIndex });
		if ((_rowActiveProp$disabl = rowActiveProp.disabled) === null || _rowActiveProp$disabl === void 0 ? void 0 : _rowActiveProp$disabl.call(rowActiveProp, row)) return;
		const isCurrentRow = rowKey ? currentRowKey === rowKeyGen(row) : currentRowRef.current === row;
		if (isCurrentRow) {
			if (!rowActiveProp.revokable) return;
			setCurrentRowKey(void 0);
			currentRowRef.current = void 0;
		} else {
			setCurrentRowKey(rowKeyGen(row));
			currentRowRef.current = row;
		}
		onCurrentChange === null || onCurrentChange === void 0 || onCurrentChange(e, row, { select: !isCurrentRow });
	}, [
		dataSourceCopy,
		rowActiveProp,
		rowKey,
		currentRowKey,
		rowKeyGen,
		onRowClick,
		onCurrentChange
	]);
	const handleRowDblclick = useCallback((e) => {
		const rowIndex = getClosestTrIndex(e.target);
		const row = dataSourceCopy[rowIndex];
		if (!row) return;
		onRowDblclick === null || onRowDblclick === void 0 || onRowDblclick(e, row, { rowIndex });
	}, [dataSourceCopy, onRowDblclick]);
	const handleRowMenu = useCallback((e) => {
		const rowIndex = getClosestTrIndex(e.target);
		const row = dataSourceCopy[rowIndex];
		if (!row) return;
		onRowMenu === null || onRowMenu === void 0 || onRowMenu(e, row, { rowIndex });
	}, [dataSourceCopy, onRowMenu]);
	const handleCellClick = useCallback((e) => {
		var _e$target;
		const rowIndex = getClosestTrIndex(e.target);
		const row = dataSourceCopy[rowIndex];
		if (!row) return;
		const colKeyVal = getClosestColKey(e.target);
		const col = tableHeaderLast.find((item) => colKeyGen(item) === colKeyVal);
		if (!col) return;
		if ((_e$target = e.target) === null || _e$target === void 0 ? void 0 : _e$target.closest(".stk-fold-icon")) {
			if (col.type === "expand") toggleExpandRow(row, col);
			else if (col.type === "tree-node") toggleTreeNode(row, col);
			return;
		}
		if (cellActive) {
			const ck = cellKeyGen(row, col);
			const result = {
				row,
				col,
				select: false,
				rowIndex
			};
			if (selectedCellRevokable && currentSelectedCellKey === ck) setCurrentSelectedCellKey(void 0);
			else {
				setCurrentSelectedCellKey(ck);
				result.select = true;
			}
			onCellSelected === null || onCellSelected === void 0 || onCellSelected(e, result);
		}
		onCellClick === null || onCellClick === void 0 || onCellClick(e, row, col, { rowIndex });
	}, [
		dataSourceCopy,
		tableHeaderLast,
		colKeyGen,
		cellActive,
		selectedCellRevokable,
		currentSelectedCellKey,
		cellKeyGen,
		onCellSelected,
		onCellClick
	]);
	const handleCellMouseOver = useCallback((e) => {
		const td = getClosestTd(e.target);
		if (!td) return;
		const rowIndex = getClosestTrIndex(e.target) || 0;
		const row = dataSourceCopy[rowIndex];
		const colKeyVal = getClosestColKey(e.target);
		const col = tableHeaderLast.find((item) => colKeyGen(item) === colKeyVal);
		onCellMouseover === null || onCellMouseover === void 0 || onCellMouseover(e, row, col);
		const related = e.relatedTarget;
		if (!related || !td.contains(related)) onCellMouseenter === null || onCellMouseenter === void 0 || onCellMouseenter(e, row, col);
	}, [
		dataSourceCopy,
		tableHeaderLast,
		colKeyGen,
		onCellMouseover,
		onCellMouseenter
	]);
	const handleTbodyMouseOut = useCallback((e) => {
		const target = e.target;
		const related = e.relatedTarget;
		const td = getClosestTd(target);
		if (td && (!related || !td.contains(related))) {
			const rowIndex = getClosestTrIndex(target) || 0;
			const row = dataSourceCopy[rowIndex];
			const colKeyVal = getClosestColKey(target);
			const col = tableHeaderLast.find((item) => colKeyGen(item) === colKeyVal);
			onCellMouseleave === null || onCellMouseleave === void 0 || onCellMouseleave(e, row, col);
		}
		const tr = getClosestTr(target);
		if (tr && (!related || !tr.contains(related))) {
			currentHoverRowRef.current = null;
			if (showTrHoverClass) setCurrentHoverRowKey(null);
		}
	}, [
		dataSourceCopy,
		tableHeaderLast,
		colKeyGen,
		showTrHoverClass,
		onCellMouseleave
	]);
	const handleCellMouseDown = useCallback((e) => {
		const rowIndex = getClosestTrIndex(e.target) || 0;
		const row = dataSourceCopy[rowIndex];
		const colKeyVal = getClosestColKey(e.target);
		const col = tableHeaderLast.find((item) => colKeyGen(item) === colKeyVal);
		onCellMousedown === null || onCellMousedown === void 0 || onCellMousedown(e, row, col, { rowIndex });
	}, [
		dataSourceCopy,
		tableHeaderLast,
		colKeyGen,
		onCellMousedown
	]);
	const handleTrMouseOver = useCallback((e) => {
		const tr = getClosestTr(e.target);
		if (!tr) return;
		const rowIndex = Number(tr.dataset.rowI);
		const row = dataSourceCopy[rowIndex];
		if (currentHoverRowRef.current === row) return;
		currentHoverRowRef.current = row;
		if (showTrHoverClass) setCurrentHoverRowKey(tr.dataset.rowKey || null);
	}, [dataSourceCopy, showTrHoverClass]);
	const toggleExpandRow = useCallback((row, col) => {
		const isExpand = row.__EXP__ === col ? !row.__EXP__ : true;
		setRowExpandFn(row, isExpand, { col });
	}, []);
	const setRowExpandFn = useCallback((rowKeyOrRow, expand, data) => {
		setDataSourceCopy((prev) => {
			const tempData = prev.slice();
			let rk;
			if (typeof rowKeyOrRow === "string") rk = rowKeyOrRow;
			else rk = rowKeyGen(rowKeyOrRow);
			const index = tempData.findIndex((it) => rowKeyGen(it) === rk);
			if (index === -1) return prev;
			for (let i = index + 1; i < tempData.length; i++) {
				var _item$__R_K__;
				if ((_item$__R_K__ = tempData[i].__R_K__) === null || _item$__R_K__ === void 0 ? void 0 : _item$__R_K__.startsWith("expanded-")) {
					tempData.splice(i, 1);
					i--;
				} else break;
			}
			const row = tempData[index];
			const col = data === null || data === void 0 ? void 0 : data.col;
			let exp = expand;
			if (exp == null) exp = row.__EXP__ === col ? !row.__EXP__ : true;
			if (exp) {
				const newExpandRow = {
					__R_K__: "expanded-" + rk,
					__EXP_R__: row,
					__EXP_C__: col
				};
				tempData.splice(index + 1, 0, newExpandRow);
			}
			if (row) row.__EXP__ = exp ? col : void 0;
			if (!(data === null || data === void 0 ? void 0 : data.silent)) onToggleRowExpand === null || onToggleRowExpand === void 0 || onToggleRowExpand({
				expanded: Boolean(exp),
				row,
				col: col || null
			});
			return tempData;
		});
	}, [rowKeyGen, onToggleRowExpand]);
	const toggleTreeNode = useCallback((row, col) => {
		const expand = row ? !row.__T_EXP__ : false;
		setDataSourceCopy((prev) => {
			const tempData = prev.slice();
			const rk = rowKeyGen(row);
			const index = tempData.findIndex((it) => rowKeyGen(it) === rk);
			if (index === -1) return prev;
			const r = tempData[index];
			const level = r.__T_LV__ || 0;
			if (expand) {
				const children = expandNode(r, level);
				tempData.splice(index + 1, 0, ...children);
			} else {
				let deleteCount = 0;
				for (let i = index + 1; i < tempData.length; i++) if (tempData[i].__T_LV__ && tempData[i].__T_LV__ > level) deleteCount++;
				else break;
				tempData.splice(index + 1, deleteCount);
			}
			r.__T_EXP__ = expand;
			onToggleTreeExpand === null || onToggleTreeExpand === void 0 || onToggleTreeExpand({
				expanded: Boolean(expand),
				row: r,
				col: col || null
			});
			return tempData;
		});
	}, [rowKeyGen, onToggleTreeExpand]);
	function expandNode(row, level) {
		var _row$children;
		let result = [];
		(_row$children = row.children) === null || _row$children === void 0 || _row$children.forEach((child) => {
			result.push(child);
			const childLv = level + 1;
			if (child.__T_EXP__ && child.children) result = result.concat(expandNode(child, childLv));
			else {
				child.__T_EXP__ = false;
				child.__T_LV__ = childLv;
			}
		});
		return result;
	}
	const handleThDragStart = useCallback((e) => {
		const th = e.target.closest("th");
		if (!th) return;
		const dragStartKey = th.dataset.colKey || "";
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", dragStartKey);
		onThDragStartCb === null || onThDragStartCb === void 0 || onThDragStartCb(dragStartKey);
	}, [onThDragStartCb]);
	const handleThDragOver = useCallback((e) => {
		const th = e.target.closest("th");
		if (!th) return;
		if (th.getAttribute("draggable") !== "true") return;
		e.dataTransfer.dropEffect = "move";
		e.preventDefault();
	}, []);
	const handleThDrop = useCallback((e) => {
		const th = e.target.closest("th");
		if (!th) return;
		const dragStartKey = e.dataTransfer.getData("text");
		const targetKey = th.dataset.colKey;
		if (dragStartKey !== targetKey) {
			const cols = columns.slice();
			const dragStartIndex = cols.findIndex((col) => colKeyGen(col) === dragStartKey);
			const dragEndIndex = cols.findIndex((col) => colKeyGen(col) === targetKey);
			if (dragStartIndex !== -1 && dragEndIndex !== -1) {
				const dragStartCol = cols[dragStartIndex];
				const mode = typeof headerDrag === "object" ? headerDrag.mode || "insert" : "insert";
				if (mode === "swap") {
					cols[dragStartIndex] = cols[dragEndIndex];
					cols[dragEndIndex] = dragStartCol;
				} else if (mode !== "none") {
					cols.splice(dragStartIndex, 1);
					cols.splice(dragEndIndex, 0, dragStartCol);
				}
				onUpdateColumns === null || onUpdateColumns === void 0 || onUpdateColumns(cols);
			}
			onColOrderChange === null || onColOrderChange === void 0 || onColOrderChange(dragStartKey, targetKey);
		}
		onThDropCb === null || onThDropCb === void 0 || onThDropCb(targetKey);
	}, [
		columns,
		colKeyGen,
		headerDrag,
		onUpdateColumns,
		onColOrderChange,
		onThDropCb
	]);
	const trDragFlagRef = useRef(false);
	const oldTrRef = useRef(null);
	const handleTrDragStart = useCallback((e, rowIndex) => {
		const tr = getClosestTr(e.target);
		if (tr) {
			const trRect = tr.getBoundingClientRect();
			const x = e.clientX - (trRect.left ?? 0);
			e.dataTransfer.setDragImage(tr, x, trRect.height / 2);
			tr.classList.add("tr-dragging");
		}
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", String(rowIndex));
		trDragFlagRef.current = true;
	}, []);
	const handleTrDragOver = useCallback((e) => {
		if (!trDragFlagRef.current) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}, []);
	const handleTrDragEnter = useCallback((e) => {
		if (!trDragFlagRef.current) return;
		e.preventDefault();
		const tr = getClosestTr(e.target);
		if (oldTrRef.current && oldTrRef.current !== tr) oldTrRef.current.classList.remove("tr-dragging-over");
		if (tr) {
			oldTrRef.current = tr;
			tr.classList.add("tr-dragging-over");
		}
	}, []);
	const handleTrDragEnd = useCallback((e) => {
		if (!trDragFlagRef.current) return;
		const tr = getClosestTr(e.target);
		if (tr) tr.classList.remove("tr-dragging");
		if (oldTrRef.current) {
			oldTrRef.current.classList.remove("tr-dragging-over");
			oldTrRef.current = null;
		}
		trDragFlagRef.current = false;
	}, []);
	const handleBodyDrop = useCallback((e) => {
		if (!trDragFlagRef.current) return;
		const trIndex = getClosestTrIndex(e.target);
		if (trIndex < 0) return;
		const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
		const endIndex = trIndex;
		if (sourceIndex === endIndex) return;
		const mode = (dragRowConfig === null || dragRowConfig === void 0 ? void 0 : dragRowConfig.mode) || "insert";
		if (mode !== "none") setDataSourceCopy((prev) => {
			const temp = prev.slice();
			const sourceRow = temp[sourceIndex];
			if (mode === "swap") {
				temp[sourceIndex] = temp[endIndex];
				temp[endIndex] = sourceRow;
			} else {
				temp.splice(sourceIndex, 1);
				temp.splice(endIndex, 0, sourceRow);
			}
			return temp;
		});
		onRowOrderChange === null || onRowOrderChange === void 0 || onRowOrderChange(String(sourceIndex), String(endIndex));
	}, [dragRowConfig, onRowOrderChange]);
	const colResizeStateRef = useRef({
		currentCol: null,
		lastCol: null,
		startX: 0,
		startOffsetTableX: 0,
		revertMoveX: false
	});
	const colResizeOn = useMemo(() => {
		if (typeof colResizable === "object") return (col) => !colResizable.disabled(col);
		return () => colResizable;
	}, [colResizable]);
	const handleThResizeMouseDown = useCallback((e, col, leftHandle = false) => {
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
			const colIndex = tableHeaderLast.findIndex((it) => colKeyGen(it) === colKeyVal);
			if (colIndex - 1 >= 0) targetCol = tableHeaderLast[colIndex - 1];
		}
		const offsetTableX = clientX - left + scrollLeft;
		setIsColResizing(true);
		colResizeStateRef.current = {
			currentCol: targetCol,
			lastCol: findLastChildCol(targetCol),
			startX: clientX,
			startOffsetTableX: offsetTableX,
			revertMoveX: false
		};
		if (colResizeIndicatorRef.current) {
			colResizeIndicatorRef.current.style.display = "block";
			colResizeIndicatorRef.current.style.left = offsetTableX + "px";
			colResizeIndicatorRef.current.style.top = scrollTop + "px";
		}
	}, [colKeyGen, tableHeaderLast]);
	function findLastChildCol(column) {
		var _column$children;
		if (column === null || column === void 0 || (_column$children = column.children) === null || _column$children === void 0 ? void 0 : _column$children.length) return findLastChildCol(column.children.slice(-1)[0]);
		return column;
	}
	useEffect(() => {
		if (!colResizable) return;
		const onMove = (e) => {
			if (!isColResizing) return;
			e.stopPropagation();
			e.preventDefault();
			const { lastCol, startX, startOffsetTableX } = colResizeStateRef.current;
			const moveX = e.clientX - startX;
			const currentColWidth = getCalculatedColWidth(lastCol);
			const mw = (lastCol === null || lastCol === void 0 ? void 0 : lastCol.minWidth) ?? colMinWidth;
			let adjustedMoveX = moveX;
			if (currentColWidth + moveX < mw) adjustedMoveX = -currentColWidth;
			const offsetTableX = startOffsetTableX + adjustedMoveX;
			if (colResizeIndicatorRef.current) colResizeIndicatorRef.current.style.left = offsetTableX + "px";
		};
		const onUp = (e) => {
			if (!isColResizing) return;
			const { startX, lastCol, revertMoveX } = colResizeStateRef.current;
			const moveX = revertMoveX ? startX - e.clientX : e.clientX - startX;
			let w = getCalculatedColWidth(lastCol) + moveX;
			if (w < colMinWidth) w = colMinWidth;
			const ck = colKeyGen(lastCol);
			const curCol = tableHeaderLast.find((it) => colKeyGen(it) === ck);
			if (curCol) {
				curCol.width = w + "px";
				onUpdateColumns === null || onUpdateColumns === void 0 || onUpdateColumns(columns.slice());
				onColResize === null || onColResize === void 0 || onColResize({ ...curCol });
				setVersion((v) => v + 1);
			}
			if (colResizeIndicatorRef.current) {
				colResizeIndicatorRef.current.style.display = "none";
				colResizeIndicatorRef.current.style.left = "0";
				colResizeIndicatorRef.current.style.top = "0";
			}
			setIsColResizing(false);
			colResizeStateRef.current = {
				currentCol: null,
				lastCol: null,
				startX: 0,
				startOffsetTableX: 0,
				revertMoveX: false
			};
		};
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		};
	}, [
		colResizable,
		isColResizing,
		colMinWidth,
		colKeyGen,
		tableHeaderLast,
		columns,
		onUpdateColumns,
		onColResize
	]);
	const setHighlightDimRow = useCallback((rowKeyValues, option = {}) => {
		if (!Array.isArray(rowKeyValues)) rowKeyValues = [rowKeyValues];
		const duration = highlightConfig.duration ? highlightConfig.duration * 1e3 : 2e3;
		const keyframe = { backgroundColor: [theme === "dark" ? "#1e4c99" : "#71a2fd", ""] };
		for (const rowKeyValue of rowKeyValues) {
			const rowEl = document.getElementById(stkTableId + "-" + String(rowKeyValue));
			if (rowEl) rowEl.animate(keyframe, duration);
		}
	}, [
		highlightConfig,
		theme,
		stkTableId
	]);
	const setHighlightDimCell = useCallback((rowKeyValue, colKeyValue, option = {}) => {
		var _tableContainerRef$cu;
		const cellEl = (_tableContainerRef$cu = tableContainerRef.current) === null || _tableContainerRef$cu === void 0 ? void 0 : _tableContainerRef$cu.querySelector(`[data-row-key="${rowKeyValue}"] [data-col-key="${colKeyValue}"]`);
		if (!cellEl) return;
		const duration = highlightConfig.duration ? highlightConfig.duration * 1e3 : 2e3;
		const keyframe = { backgroundColor: [theme === "dark" ? "#1e4c99" : "#71a2fd", ""] };
		cellEl.animate(keyframe, duration);
	}, [highlightConfig, theme]);
	const setCurrentRow = useCallback((rowKeyOrRow, option = {}) => {
		const select = rowKeyOrRow !== void 0;
		if (!select) {
			currentRowRef.current = void 0;
			setCurrentRowKey(void 0);
		} else if (typeof rowKeyOrRow === "string") {
			setCurrentRowKey(rowKeyOrRow);
			const row = dataSourceCopy.find((item) => rowKeyGen(item) === rowKeyOrRow);
			if (row) currentRowRef.current = row;
		} else {
			currentRowRef.current = rowKeyOrRow;
			setCurrentRowKey(rowKeyGen(rowKeyOrRow));
		}
		if (!option.silent) onCurrentChange === null || onCurrentChange === void 0 || onCurrentChange(null, select ? currentRowRef.current : void 0, { select });
	}, [
		dataSourceCopy,
		rowKeyGen,
		onCurrentChange
	]);
	const setSelectedCell = useCallback((row, col, option = { silent: false }) => {
		if (!dataSourceCopy.length) return;
		const select = row !== void 0 && col !== void 0;
		setCurrentSelectedCellKey(select ? cellKeyGen(row, col) : void 0);
		if (!option.silent) onCellSelected === null || onCellSelected === void 0 || onCellSelected(null, {
			row,
			col,
			select
		});
	}, [
		dataSourceCopy,
		cellKeyGen,
		onCellSelected
	]);
	const setSorter = useCallback((colKeyVal, order, option = {}) => {
		const { silent = true, sort = true } = option;
		if (order) {
			const column = tableHeaderLast.find((it) => colKeyGen(it) === colKeyVal);
			if (column) {
				const newState = {
					key: colKeyVal,
					dataIndex: column.dataIndex,
					sortField: column.sortField,
					sortType: column.sortType,
					order
				};
				setSortStates([newState]);
			}
		} else setSortStates([]);
		if (sort && dataSource.length) {
			if (!sortRemote || option.force) initDataSource(dataSource, { forceSort: option.force });
		}
		return dataSourceCopy;
	}, [
		tableHeaderLast,
		colKeyGen,
		dataSource,
		sortRemote,
		initDataSource,
		dataSourceCopy
	]);
	const resetSorter = useCallback(() => {
		setSortStates([]);
		initDataSource();
	}, [initDataSource]);
	const getSortColumns = useCallback(() => {
		return sortStates.map((s) => ({
			key: s.key || s.dataIndex,
			order: s.order
		}));
	}, [sortStates]);
	const setFilter = useCallback((status, option) => {
		status = status || {};
		filterStatusRef.current = status;
		if (!(option === null || option === void 0 ? void 0 : option.remote)) initDataSource();
		if (!(option === null || option === void 0 ? void 0 : option.silent)) onFilterChange === null || onFilterChange === void 0 || onFilterChange(status);
	}, [initDataSource, onFilterChange]);
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
				if (typeof autoResize === "function") autoResize();
				debounceTime = 0;
			}, 200);
		};
		let resizeObserver = null;
		if (window.ResizeObserver) {
			resizeObserver = new ResizeObserver(resizeCallback);
			resizeObserver.observe(container);
		} else window.addEventListener("resize", resizeCallback);
		return () => {
			if (resizeObserver) resizeObserver.disconnect();
			else window.removeEventListener("resize", resizeCallback);
		};
	}, [
		autoResize,
		virtual,
		virtualX,
		initVirtualScroll
	]);
	useEffect(() => {
		if (!virtual_on) return;
		let isMouseOver = false;
		const container = tableContainerRef.current;
		const handleKeydown = (e) => {
			if (!isMouseOver) return;
			if (![
				"ArrowUp",
				"ArrowRight",
				"ArrowDown",
				"ArrowLeft",
				"PageUp",
				"PageDown",
				"Home",
				"End"
			].includes(e.code)) return;
			e.preventDefault();
			const { scrollTop, rowHeight: rh, containerHeight, scrollHeight } = virtualScrollRef.current;
			const { scrollLeft } = virtualScrollXRef.current;
			const headerHeight = headless ? 0 : tableHeadersRef.current.length * headerRowHeight;
			const bodyPageSize = Math.floor((containerHeight - headerHeight) / rh);
			if (e.code === "ArrowUp") scrollTo(scrollTop - rh, null);
			else if (e.code === "ArrowDown") scrollTo(scrollTop + rh, null);
			else if (e.code === "ArrowRight") scrollTo(null, scrollLeft + 50);
			else if (e.code === "ArrowLeft") scrollTo(null, scrollLeft - 50);
			else if (e.code === "PageUp") scrollTo(scrollTop - rh * bodyPageSize + headerHeight, null);
			else if (e.code === "PageDown") scrollTo(scrollTop + rh * bodyPageSize - headerHeight, null);
			else if (e.code === "Home") scrollTo(0, null);
			else if (e.code === "End") scrollTo(scrollHeight, null);
		};
		const handleMouseEnter = () => {
			isMouseOver = true;
		};
		const handleMouseLeave = () => {
			isMouseOver = false;
		};
		window.addEventListener("keydown", handleKeydown);
		container === null || container === void 0 || container.addEventListener("mouseenter", handleMouseEnter);
		container === null || container === void 0 || container.addEventListener("mouseleave", handleMouseLeave);
		return () => {
			window.removeEventListener("keydown", handleKeydown);
			container === null || container === void 0 || container.removeEventListener("mouseenter", handleMouseEnter);
			container === null || container === void 0 || container.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [
		virtual_on,
		headless,
		headerRowHeight,
		scrollTo
	]);
	useEffect(() => {
		dealColumns(columns);
		setVersion((v) => v + 1);
	}, []);
	useEffect(() => {
		initDataSource();
	}, [dataSource]);
	useEffect(() => {
		dealColumns(columns);
		setVersion((v) => v + 1);
		requestAnimationFrame(() => {
			initVirtualScrollX();
		});
	}, [columns]);
	useEffect(() => {
		requestAnimationFrame(() => {
			initVirtualScroll();
			if (sortConfig.defaultSort) {
				const { key, dataIndex, order, silent } = {
					silent: true,
					...sortConfig.defaultSort
				};
				setSorter(key || dataIndex, order, {
					force: false,
					silent
				});
			}
		});
	}, []);
	useImperativeHandle(ref, () => ({
		initVirtualScroll,
		initVirtualScrollX,
		initVirtualScrollY,
		setCurrentRow,
		setSelectedCell,
		setHighlightDimCell,
		setHighlightDimRow,
		sortCol: () => {
			var _sortStates$;
			return (_sortStates$ = sortStates[0]) === null || _sortStates$ === void 0 ? void 0 : _sortStates$.dataIndex;
		},
		sortStates: () => sortStates,
		getSortColumns,
		setSorter,
		resetSorter,
		scrollTo,
		getTableData: () => dataSourceCopy,
		getRowIndex: (row) => {
			const targetKey = rowKeyGen(row);
			return dataSourceCopy.findIndex((item) => rowKeyGen(item) === targetKey);
		},
		getColumnIndex: (column) => {
			const targetKey = colKeyGen(column);
			return tableHeaderLast.findIndex((item) => colKeyGen(item) === targetKey);
		},
		setRowExpand: setRowExpandFn,
		setAutoHeight: (rowKeyVal, height) => {
			const key = String(rowKeyVal);
			if (!height) autoRowHeightMapRef.current.delete(key);
			else autoRowHeightMapRef.current.set(key, height);
		},
		clearAllAutoHeight: () => autoRowHeightMapRef.current.clear(),
		setTreeExpand: (row, option) => {
			toggleTreeNode(row, null);
		},
		getSelectedArea: () => ({
			rows: [],
			cols: [],
			ranges: []
		}),
		setAreaSelection: () => {},
		clearSelectedArea: () => {},
		copySelectedArea: () => "",
		setFilter
	}), [
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
		setFilter
	]);
	const getAbsoluteRowIndex = (rowIndex) => rowIndex + virtualScrollRef.current.startIndex;
	const getHeaderTitle = (col) => {
		const ck = colKeyGen(col);
		if (hideHeaderTitle === true || Array.isArray(hideHeaderTitle) && hideHeaderTitle.includes(ck)) return "";
		return col.title || "";
	};
	const isHeaderDraggable = (col) => {
		var _headerDrag$disabled;
		if (!headerDrag) return false;
		if (typeof headerDrag === "object") return !((_headerDrag$disabled = headerDrag.disabled) === null || _headerDrag$disabled === void 0 ? void 0 : _headerDrag$disabled.call(headerDrag, col));
		return true;
	};
	const containerClass = useMemo(() => {
		const classes = ["stk-table"];
		if (virtual) classes.push("virtual");
		if (virtualX) classes.push("virtual-x");
		if (virtual_on) classes.push("vt-on");
		if (theme === "light") classes.push("light");
		if (theme === "dark") classes.push("dark");
		if (headless) classes.push("headless");
		if (isColResizing) classes.push("is-col-resizing");
		if (colResizable) classes.push("col-resizable");
		if (bordered) {
			classes.push("bordered");
			if (typeof bordered === "string") classes.push(`bordered-${bordered}`);
		}
		if (stripe) classes.push("stripe");
		if (cellHover) classes.push("cell-hover");
		if (cellActive) classes.push("cell-active");
		if (rowHover) classes.push("row-hover");
		if (rowActiveProp.enabled) classes.push("row-active");
		if (showOverflow) classes.push("text-overflow");
		if (showHeaderOverflow) classes.push("header-text-overflow");
		if (isRelativeMode) classes.push("fixed-relative-mode");
		if (autoRowHeight) classes.push("auto-row-height");
		if (scrollbarOptions.enabled) classes.push("scrollbar-on");
		if (isExperimentalScrollY) classes.push("exp-scroll-y");
		if (className) classes.push(className);
		return classes.join(" ");
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
		isExperimentalScrollY
	]);
	const containerStyle = useMemo(() => ({
		"--row-height": autoRowHeight ? void 0 : virtualScrollRef.current.rowHeight + "px",
		"--header-row-height": headerRowHeight + "px",
		"--footer-row-height": footerRowHeight + "px",
		"--sb-width": `${scrollbarOptions.width}px`,
		"--sb-height": `${scrollbarOptions.height}px`
	}), [
		autoRowHeight,
		headerRowHeight,
		footerRowHeight,
		scrollbarOptions,
		version
	]);
	const mergedContainerStyle = useMemo(() => ({
		...containerStyle,
		...style
	}), [containerStyle, style]);
	const ctxValue = useMemo(() => ({
		dataSource: dataSourceCopy,
		theme: theme === "dark" ? "dark" : "light",
		setFilter
	}), [
		dataSourceCopy,
		theme,
		setFilter
	]);
	return /* @__PURE__ */ jsx(StkTableContext.Provider, {
		value: ctxValue,
		children: /* @__PURE__ */ jsxs("div", {
			ref: tableContainerRef,
			className: containerClass,
			style: mergedContainerStyle,
			onScroll: onTableScroll,
			onWheel: onTableWheel,
			children: [
				colResizable && /* @__PURE__ */ jsx("div", {
					ref: colResizeIndicatorRef,
					className: "column-resize-indicator"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "stk-table-scroll-container",
					children: /* @__PURE__ */ jsxs("table", {
						className: `stk-table-main${fixedMode ? " fixed-mode" : ""}`,
						style: {
							width: width || void 0,
							minWidth: minWidth || void 0,
							maxWidth: maxWidth || void 0
						},
						onDragOver: handleTrDragOver,
						onDragEnter: handleTrDragEnter,
						onDragEnd: handleTrDragEnd,
						onClick: handleRowClick,
						onDoubleClick: handleRowDblclick,
						onContextMenu: handleRowMenu,
						onMouseOver: handleTrMouseOver,
						children: [
							!headless && /* @__PURE__ */ jsx("thead", { children: tableHeaders.map((row, rowIndex) => /* @__PURE__ */ jsxs("tr", {
								onContextMenu: (e) => onHeaderRowMenu === null || onHeaderRowMenu === void 0 ? void 0 : onHeaderRowMenu(e),
								children: [
									virtualX_on && /* @__PURE__ */ jsx("th", {
										className: "vt-x-left",
										style: {
											minWidth: virtualScrollXRef.current.offsetLeft,
											width: virtualScrollXRef.current.offsetLeft
										}
									}),
									row.map((col, colIndex) => {
										const ck = colKeyGen(col);
										const sortState = getColumnSortState(ck);
										const isSorted = !!sortState && sortState.order !== null;
										const thClasses = [
											col.sorter ? "sortable" : "",
											isSorted ? "sorter-" + (sortState === null || sortState === void 0 ? void 0 : sortState.order) : "",
											col.headerClassName || "",
											...fixedColClassMap.get(ck) || [],
											col.headerAlign === "left" ? "text-l" : col.headerAlign === "right" ? "text-r" : col.headerAlign === "center" ? "text-c" : ""
										].filter(Boolean).join(" ");
										return /* @__PURE__ */ jsxs("th", {
											"data-col-key": ck,
											draggable: isHeaderDraggable(col),
											rowSpan: col.__R_SP__,
											colSpan: col.__C_SP__,
											style: cellStyleMap[TagType.TH].get(ck),
											title: getHeaderTitle(col),
											className: thClasses,
											onClick: (e) => {
												onColumnSort(col);
												onHeaderCellClick === null || onHeaderCellClick === void 0 || onHeaderCellClick(e, col);
											},
											onDragStart: handleThDragStart,
											onDrop: handleThDrop,
											onDragOver: handleThDragOver,
											children: [
												colResizeOn(col) && colIndex > 0 && /* @__PURE__ */ jsx("div", {
													className: "table-header-resizer left",
													onMouseDown: (e) => handleThResizeMouseDown(e, col, true)
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "table-header-cell-wrapper",
													style: col.__R_SP__ ? { "--row-span": col.__R_SP__ } : void 0,
													children: [col.customHeaderCell ? React.createElement(col.customHeaderCell, {
														col,
														colIndex,
														rowIndex
													}) : renderHeader ? renderHeader(col) : /* @__PURE__ */ jsx("span", {
														className: "table-header-title",
														children: col.title
													}), col.sorter && /* @__PURE__ */ jsx(SortIcon, { className: "table-header-sorter" })]
												}),
												colResizeOn(col) && /* @__PURE__ */ jsx("div", {
													className: "table-header-resizer right",
													onMouseDown: (e) => handleThResizeMouseDown(e, col)
												})
											]
										}, ck);
									}),
									virtualX_on && /* @__PURE__ */ jsx("th", {
										className: "vt-x-right",
										style: {
											minWidth: virtualX_offsetRight,
											width: virtualX_offsetRight
										}
									})
								]
							}, rowIndex)) }),
							footerData && footerData.length > 0 && (isFooterTop ? /* @__PURE__ */ jsx("tbody", {
								className: "stk-footer",
								style: {
									position: "sticky",
									top: tableHeaderHeight
								},
								children: renderFooter()
							}) : /* @__PURE__ */ jsx("tfoot", {
								className: "stk-footer",
								children: renderFooter()
							})),
							/* @__PURE__ */ jsxs("tbody", {
								className: "stk-tbody-main",
								style: isExperimentalScrollY ? { transform: `translateY(${virtualScrollRef.current.translateY}px)` } : void 0,
								onClick: handleCellClick,
								onMouseDown: handleCellMouseDown,
								onMouseOver: handleCellMouseOver,
								onMouseOut: handleTbodyMouseOut,
								onDrop: handleBodyDrop,
								children: [
									virtual_on && /* @__PURE__ */ jsx("tr", {
										style: { height: virtualScrollRef.current.offsetTop },
										className: "padding-top-tr",
										children: fixedMode && headless && virtualX_columnPart.map((col, idx) => /* @__PURE__ */ jsx("td", { style: cellStyleMap[TagType.TD].get(colKeyGen(col)) }, idx))
									}),
									virtual_dataSourcePart.map((row, rowIndex) => {
										const rk = rowKeyGen(row);
										const absRowIndex = getAbsoluteRowIndex(rowIndex);
										if (row && row.__EXP_R__) return /* @__PURE__ */ jsx("tr", {
											"data-row-key": rk,
											"data-row-i": absRowIndex,
											className: "expanded-row",
											children: /* @__PURE__ */ jsx("td", {
												colSpan: expandRowColspan,
												children: /* @__PURE__ */ jsx("div", {
													className: "table-cell-wrapper",
													tabIndex: -1,
													children: renderExpand ? renderExpand(row.__EXP_R__, row.__EXP_C__) : row.__EXP_R__ && row.__EXP_C__ && row.__EXP_R__[row.__EXP_C__.dataIndex] || ""
												})
											})
										}, rk);
										const trClasses = [
											rowClassName(row, absRowIndex) || "",
											(row === null || row === void 0 ? void 0 : row.__EXP__) ? "expanded" : "",
											currentRowKey == rk || row === currentRowRef.current ? "active" : "",
											showTrHoverClass && rk === currentHoverRowKey ? "hover" : ""
										].filter(Boolean).join(" ");
										return /* @__PURE__ */ jsxs("tr", {
											id: stkTableId + "-" + rk,
											"data-row-key": rk,
											"data-row-i": absRowIndex,
											className: trClasses,
											children: [
												virtualX_on && /* @__PURE__ */ jsx("td", { className: "vt-x-left" }),
												virtualX_columnPart.map((col, _colIdx) => {
													if (col.__VT_C_SP__) return /* @__PURE__ */ jsx("td", {
														className: "vt-x-spacer",
														colSpan: col.__VT_C_SP__
													}, `spacer-${_colIdx}`);
													const ck = colKeyGen(col);
													const cellKey = cellKeyGen(row, col);
													const tdClasses = [
														col.className || "",
														...fixedColClassMap.get(ck) || [],
														col.align === "center" ? "text-c" : col.align === "right" ? "text-r" : "",
														cellActive && currentSelectedCellKey === cellKey ? "active" : "",
														col.type === "seq" ? "seq-column" : "",
														col.type === "expand" && row.__EXP__ && colKeyGen(row.__EXP__) === ck ? "expanded" : "",
														row.__T_EXP__ && col.type === "tree-node" ? "tree-expanded" : "",
														col.type === "dragRow" ? "drag-row-cell" : ""
													].filter(Boolean).join(" ");
													return /* @__PURE__ */ jsx("td", {
														"data-col-key": ck,
														style: cellStyleMap[TagType.TD].get(ck),
														className: tdClasses,
														children: col.customCell ? React.createElement(col.customCell, {
															className: "table-cell-wrapper",
															tabIndex: -1,
															col,
															row,
															rowIndex: absRowIndex,
															colIndex: col.__LF_S__ ?? 0,
															cellValue: row && row[col.dataIndex],
															expanded: row && row.__EXP__,
															treeExpanded: row && row.__T_EXP__
														}) : !col.type ? /* @__PURE__ */ jsx("div", {
															className: "table-cell-wrapper",
															tabIndex: -1,
															title: row[col.dataIndex] || "",
															children: (row && row[col.dataIndex]) != null ? row[col.dataIndex] : getEmptyCellTextFn(col, row)
														}) : col.type === "seq" ? /* @__PURE__ */ jsx("div", {
															className: "table-cell-wrapper",
															tabIndex: -1,
															children: (seqConfig.startIndex || 0) + absRowIndex + 1
														}) : col.type === "tree-node" ? /* @__PURE__ */ jsx(TreeNodeCell, {
															col,
															row,
															onTriangleClick: (e) => toggleTreeNode(row, col)
														}) : /* @__PURE__ */ jsxs("div", {
															className: "table-cell-wrapper",
															tabIndex: -1,
															title: row[col.dataIndex] || "",
															children: [
																col.type === "dragRow" && /* @__PURE__ */ jsx(DragHandle, { onDragStart: (e) => handleTrDragStart(e, absRowIndex) }),
																col.type === "expand" && /* @__PURE__ */ jsx(TriangleIcon, { onClick: (e) => toggleExpandRow(row, col) }),
																row[col.dataIndex] != null && /* @__PURE__ */ jsx("span", { children: row[col.dataIndex] })
															]
														})
													}, ck);
												}),
												virtualX_on && /* @__PURE__ */ jsx("td", { className: "vt-x-right" })
											]
										}, rk);
									}),
									virtual_on && /* @__PURE__ */ jsx("tr", { style: { height: virtual_offsetBottom } })
								]
							})
						]
					})
				}),
				(!dataSourceCopy || !dataSourceCopy.length) && showNoData && /* @__PURE__ */ jsx("div", {
					className: `stk-table-no-data${noDataFull ? " no-data-full" : ""}`,
					children: renderEmpty ? renderEmpty() : "暂无数据"
				}),
				renderCustomBottom === null || renderCustomBottom === void 0 ? void 0 : renderCustomBottom()
			]
		})
	});
	function renderFooter() {
		return footerData.map((footRow, footRowIndex) => /* @__PURE__ */ jsxs("tr", { children: [
			virtualX_on && /* @__PURE__ */ jsx("td", {
				className: "vt-x-left",
				style: {
					minWidth: virtualScrollXRef.current.offsetLeft,
					width: virtualScrollXRef.current.offsetLeft
				}
			}),
			virtualX_columnPart.map((col, _colIdx) => {
				if (col.__VT_C_SP__) return /* @__PURE__ */ jsx("td", {
					className: "vt-x-spacer",
					colSpan: col.__VT_C_SP__
				}, `spacer-${_colIdx}`);
				const ck = colKeyGen(col);
				return /* @__PURE__ */ jsx("td", {
					"data-col-key": ck,
					style: cellStyleMap[TagType.TF].get(ck),
					className: [
						col.className,
						...fixedColClassMap.get(ck) || [],
						col.type === "seq" ? "seq-column" : "",
						col.align === "center" ? "text-c" : col.align === "right" ? "text-r" : ""
					].filter(Boolean).join(" "),
					children: col.customFooterCell ? React.createElement(col.customFooterCell, {
						className: "table-cell-wrapper",
						tabIndex: -1,
						col,
						row: footRow,
						rowIndex: footRowIndex,
						cellValue: footRow[col.dataIndex]
					}) : /* @__PURE__ */ jsx("div", {
						className: "table-cell-wrapper",
						tabIndex: -1,
						title: footRow[col.dataIndex] || "",
						children: footRow[col.dataIndex] != null && /* @__PURE__ */ jsx("span", { children: footRow[col.dataIndex] })
					})
				}, ck);
			}),
			virtualX_on && /* @__PURE__ */ jsx("td", {
				className: "vt-x-right",
				style: {
					minWidth: virtualX_offsetRight,
					width: virtualX_offsetRight
				}
			})
		] }, footRowIndex));
	}
});
StkTable.displayName = "StkTable";
//#endregion
//#region src/StkTable/custom-cells/FilterCell/Dropdown.tsx
var DROPDOWN_DEFAULT_WIDTH = 300;
var DROPDOWN_DEFAULT_HEIGHT = 400;
var PADDING = 6;
var Dropdown = forwardRef((_props, ref) => {
	const [theme, setTheme] = useState("light");
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState({
		x: 0,
		y: 0
	});
	const [options, setOptions] = useState([]);
	const [checkedSet, setCheckedSet] = useState(() => /* @__PURE__ */ new Set());
	const dropdownEl = useRef(null);
	const onConfirmRef = useRef(() => {});
	const pendingPosRef = useRef(null);
	const visibleRef = useRef(visible);
	visibleRef.current = visible;
	const optionsRef = useRef(options);
	optionsRef.current = options;
	const checkedSetRef = useRef(checkedSet);
	checkedSetRef.current = checkedSet;
	function getDropdownSize() {
		if (!dropdownEl.current) return [DROPDOWN_DEFAULT_WIDTH, DROPDOWN_DEFAULT_HEIGHT];
		const rect = dropdownEl.current.getBoundingClientRect();
		return [rect.width || DROPDOWN_DEFAULT_WIDTH, rect.height || DROPDOWN_DEFAULT_HEIGHT];
	}
	function calculatePosition(docPos) {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = document.documentElement.clientHeight;
		const [dropdownWidth, dropdownHeight] = getDropdownSize();
		let finalX = docPos.x;
		let finalY = docPos.y;
		if (docPos.x - scrollLeft + dropdownWidth > viewportWidth - PADDING) finalX = viewportWidth - dropdownWidth - PADDING + scrollLeft;
		const relativeY = docPos.y - scrollTop;
		if (relativeY + dropdownHeight > viewportHeight - PADDING) {
			const triggerHeight = docPos.height || 30;
			if (relativeY - triggerHeight >= dropdownHeight + PADDING) finalY = docPos.y - triggerHeight - dropdownHeight - PADDING;
			else finalY = PADDING + scrollTop;
		}
		finalX = Math.max(PADDING + scrollLeft, finalX);
		finalY = Math.max(PADDING + scrollTop, finalY);
		return {
			x: finalX,
			y: finalY
		};
	}
	const hide = useCallback(() => {
		setVisible(false);
		setOptions([]);
		setCheckedSet(/* @__PURE__ */ new Set());
	}, []);
	const show = useCallback((pos, opt, onConfirm) => {
		if (dropdownEl.current) dropdownEl.current.style.visibility = "hidden";
		onConfirmRef.current = onConfirm;
		pendingPosRef.current = pos;
		setOptions(opt || []);
		setCheckedSet(new Set((opt || []).filter((o) => o.selected).map((o) => o.value)));
		setVisible(true);
	}, []);
	useLayoutEffect(() => {
		if (visible && pendingPosRef.current) {
			setPosition(calculatePosition(pendingPosRef.current));
			pendingPosRef.current = null;
			if (dropdownEl.current) dropdownEl.current.style.visibility = "visible";
		}
	}, [visible, options]);
	useEffect(() => {
		function handleClickOutside(e) {
			var _dropdownEl$current;
			if (!visibleRef.current || ((_dropdownEl$current = dropdownEl.current) === null || _dropdownEl$current === void 0 ? void 0 : _dropdownEl$current.contains(e.target))) return;
			hide();
		}
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [hide]);
	function updateChecked(checked, row) {
		setCheckedSet((prev) => {
			const next = new Set(prev);
			if (checked) next.add(row.value);
			else next.delete(row.value);
			return next;
		});
	}
	function confirm() {
		optionsRef.current.forEach((opt) => opt.selected = checkedSetRef.current.has(opt.value));
		onConfirmRef.current(Array.from(checkedSetRef.current));
		hide();
	}
	function handleClear() {
		optionsRef.current.forEach((opt) => opt.selected = false);
		onConfirmRef.current([]);
		hide();
	}
	function handleRowClick(_e, row) {
		updateChecked(!checkedSetRef.current.has(row.value), row);
	}
	const columns = useMemo(() => [{
		title: "",
		dataIndex: "value",
		width: 30,
		className: "stk-filter-dropdown-checkbox",
		customCell: (cellProps) => {
			var _cellProps$row;
			return /* @__PURE__ */ jsx("input", {
				type: "checkbox",
				checked: checkedSet.has((_cellProps$row = cellProps.row) === null || _cellProps$row === void 0 ? void 0 : _cellProps$row.value),
				readOnly: true
			});
		}
	}, {
		title: "",
		dataIndex: "label"
	}], [checkedSet]);
	useImperativeHandle(ref, () => ({
		get visible() {
			return visibleRef.current;
		},
		show,
		hide,
		setTheme: (t) => setTheme(t)
	}), [show, hide]);
	return /* @__PURE__ */ jsxs("div", {
		ref: dropdownEl,
		className: `stk-filter-dropdown stk-filter-dropdown--${theme}`,
		style: {
			top: position.y + "px",
			left: position.x + "px",
			display: visible ? void 0 : "none"
		},
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ jsx(StkTable, {
			rowKey: "value",
			headless: true,
			virtual: true,
			noDataFull: true,
			theme,
			rowActive: false,
			rowHeight: 20,
			bordered: false,
			columns,
			dataSource: options,
			onRowClick: handleRowClick
		}), /* @__PURE__ */ jsxs("footer", { children: [/* @__PURE__ */ jsx("button", {
			onClick: handleClear,
			children: "↺"
		}), /* @__PURE__ */ jsx("button", {
			onClick: confirm,
			children: "✓"
		})] })]
	});
});
Dropdown.displayName = "StkFilterDropdown";
var dropdownApi = null;
function getDropdownIns() {
	if (!dropdownApi) {
		const div = document.createElement("div");
		div.classList.add("stk-filter-dropdown-wrapper");
		document.body.appendChild(div);
		const root = createRoot(div);
		const apiRef = { current: null };
		root.render(/* @__PURE__ */ jsx(Dropdown, { ref: (r) => {
			apiRef.current = r;
		} }));
		return new Promise((resolve) => {
			const check = () => {
				if (apiRef.current) {
					dropdownApi = apiRef.current;
					resolve(apiRef.current);
				} else setTimeout(check, 0);
			};
			check();
		});
	}
	return Promise.resolve(dropdownApi);
}
//#endregion
//#region src/StkTable/custom-cells/FilterCell/index.tsx
/**
* 从数据源提取筛选选项
*
* @param dataSource 数据源
* @param columnKey 列名
* @returns 筛选选项数组
*/
function extractFilterOptions(dataSource, columnKey) {
	const uniqueValues = /* @__PURE__ */ new Set();
	dataSource.forEach((row) => {
		const val = row[columnKey];
		if (val !== void 0 && val !== null) uniqueValues.add(val);
	});
	return Array.from(uniqueValues).map((value) => ({
		label: String(value),
		value
	}));
}
function FilterView(props) {
	const theme = props.theme || "light";
	function handleConfirm(value) {
		props.onChange(value);
	}
	function handleIconClick(e) {
		e.stopPropagation();
		const rect = e.target.getBoundingClientRect();
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
		getDropdownIns().then((ins) => {
			if (ins.visible) {
				ins.hide();
				return;
			}
			ins.setTheme(theme);
			ins.show({
				x: rect.left + scrollLeft,
				y: rect.bottom + scrollTop,
				height: rect.height
			}, props.getOptions(), handleConfirm);
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: [
			"stk-filter",
			props.active ? "stk-filter--active" : "",
			`stk-filter--${theme}`
		].filter(Boolean).join(" "),
		children: [props.children ?? /* @__PURE__ */ jsx("span", { children: props.col.title }), /* @__PURE__ */ jsx("svg", {
			className: "stk-filter-icon",
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: "0 0 1024 1024",
			onClick: handleIconClick,
			children: /* @__PURE__ */ jsx("path", {
				fill: "currentColor",
				d: "M950.58 0 l-894.06 0 q-91.93 17.17 -34.34 119.21 l293.97 251.54 l6.06 9.1 q16.17 20.2 16.17 47.48 l0 468.74 l1.01 8.08 q3.03 10.11 9.09 19.2 q2.02 2.02 5.05 7.07 q36.37 33.34 84.86 4.04 l216.19 -124.26 q21.21 -22.22 18.18 -50.51 l0 -332.36 l1.01 -11.12 q4.04 -26.26 22.23 -45.46 l292.96 -251.54 l9.1 -10.11 q43.44 -54.55 14.14 -81.82 q-28.29 -27.28 -61.62 -27.28 ZM832.38 119.21 l-277.81 235.38 l0 377.82 l-96.98 55.57 l0 -433.39 l-275.8 -235.38 l650.59 0 Z"
			})
		})]
	});
}
/**
* 表格筛选功能工厂函数 (BETA)
*
* 通过 StkTableContext 获取所在表格的 dataSource / theme / setFilter。
* @beta
* @returns
*/
function createFilterCell(option) {
	const filterStatus = { current: {} };
	function Filter(config, component) {
		function FilterHeaderCell(props) {
			var _filterStatus$current;
			const ctx = useContext(StkTableContext);
			const colKey = props.col.dataIndex;
			const theme = (ctx === null || ctx === void 0 ? void 0 : ctx.theme) || "light";
			const filterNumber = ((_filterStatus$current = filterStatus.current[colKey]) === null || _filterStatus$current === void 0 ? void 0 : _filterStatus$current.value.length) || 0;
			function getAutoOptions() {
				if (!(config === null || config === void 0 ? void 0 : config.autoOptions)) return [];
				return extractFilterOptions((ctx === null || ctx === void 0 ? void 0 : ctx.dataSource) || [], colKey);
			}
			function getResolvedOptions() {
				return (config === null || config === void 0 ? void 0 : config.options) ?? getAutoOptions();
			}
			function handleChange(value) {
				var _filterStatus$current2, _option$onChange;
				filterStatus.current[colKey] = {
					value,
					filter: (config === null || config === void 0 ? void 0 : config.filter) ?? ((_filterStatus$current2 = filterStatus.current[colKey]) === null || _filterStatus$current2 === void 0 ? void 0 : _filterStatus$current2.filter)
				};
				option === null || option === void 0 || (_option$onChange = option.onChange) === null || _option$onChange === void 0 || _option$onChange.call(option, {
					colKey,
					status: filterStatus.current[colKey]
				});
				ctx === null || ctx === void 0 || ctx.setFilter(filterStatus.current, option);
			}
			return /* @__PURE__ */ jsx(FilterView, {
				...props,
				theme,
				active: filterNumber > 0,
				getOptions: getResolvedOptions,
				onChange: handleChange,
				children: component ? React.createElement(component, props) : void 0
			});
		}
		FilterHeaderCell.displayName = "StkFilterHeaderCell";
		return FilterHeaderCell;
	}
	return {
		Filter,
		filterStatus
	};
}
//#endregion
//#region src/StkTable/custom-cells/EditableCell/index.tsx
function EditableCellView(props) {
	const trigger = props.trigger || "dblclick";
	const [editValue, setEditValue] = useState(props.cellValue);
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef(null);
	const rootRef = useRef(null);
	const displayValue = props.cellValue !== void 0 && props.cellValue !== null ? props.cellValue : "";
	useEffect(() => {
		if (!isEditing) setEditValue(props.cellValue);
	}, [props.cellValue]);
	useEffect(() => {
		var _inputRef$current;
		if (isEditing) (_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 || _inputRef$current.focus();
	}, [isEditing]);
	function refocusContainer() {
		var _rootRef$current, _rootRef$current$clos;
		const el = (_rootRef$current = rootRef.current) === null || _rootRef$current === void 0 || (_rootRef$current$clos = _rootRef$current.closest) === null || _rootRef$current$clos === void 0 ? void 0 : _rootRef$current$clos.call(_rootRef$current, ".stk-table");
		el === null || el === void 0 || el.focus();
	}
	function finishEditing() {
		var _props$onChange;
		setIsEditing(false);
		const newValue = editValue;
		const { row, col } = props;
		row[col.dataIndex] = newValue;
		(_props$onChange = props.onChange) === null || _props$onChange === void 0 || _props$onChange.call(props, newValue);
		refocusContainer();
	}
	function cancelEditing() {
		setIsEditing(false);
		setEditValue(props.cellValue);
		refocusContainer();
	}
	function onTrigger(e) {
		if (e.type !== trigger) return;
		setEditValue(props.cellValue);
		setIsEditing(true);
	}
	function onBlur() {
		if (!isEditing) return;
		finishEditing();
	}
	function onKeydown(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			finishEditing();
		} else if (e.key === "Escape" || e.key === "Esc") {
			e.preventDefault();
			e.stopPropagation();
			cancelEditing();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") e.stopPropagation();
		else if (e.key === "Tab") finishEditing();
		else e.stopPropagation();
	}
	return /* @__PURE__ */ jsx("div", {
		ref: rootRef,
		className: "stk-editable-cell",
		onDoubleClick: onTrigger,
		onClick: onTrigger,
		children: !isEditing ? displayValue : /* @__PURE__ */ jsx("input", {
			ref: inputRef,
			className: "stk-editable-cell-input",
			value: editValue ?? "",
			onBlur,
			onChange: (e) => setEditValue(e.target.value),
			onKeyDown: onKeydown
		})
	});
}
/**
* 可编辑单元格工厂函数
* @param option 配置选项
* @returns EditableCell 组件
*/
function createEditableCell(option) {
	function EditableCell(props) {
		return /* @__PURE__ */ jsx(EditableCellView, {
			...props,
			trigger: (option === null || option === void 0 ? void 0 : option.trigger) || "dblclick",
			onChange: (newValue) => {
				var _option$onChange;
				option === null || option === void 0 || (_option$onChange = option.onChange) === null || _option$onChange === void 0 || _option$onChange.call(option, newValue, props.row, props.col.dataIndex);
			}
		});
	}
	return { EditableCell };
}
//#endregion
//#region src/StkTable/custom-cells/CheckboxCell/index.tsx
function CheckboxView(props) {
	const { checked, indeterminate, customComponent: CustomComp, onChange } = props;
	/** 防重保护：部分 UI 库会同时触发多个事件 */
	const lastValueRef = useRef(void 0);
	function handleChange(e) {
		var _e$target;
		let c;
		if (typeof e === "boolean") c = e;
		else if ((e === null || e === void 0 || (_e$target = e.target) === null || _e$target === void 0 ? void 0 : _e$target.checked) !== void 0) c = e.target.checked;
		else c = !!e;
		if (c === lastValueRef.current) return;
		lastValueRef.current = c;
		onChange === null || onChange === void 0 || onChange(c);
	}
	if (CustomComp) return /* @__PURE__ */ jsx("div", {
		className: "stk-checkbox-cell",
		children: /* @__PURE__ */ jsx(CustomComp, {
			modelValue: checked,
			checked,
			indeterminate,
			onChange: handleChange,
			onClick: (e) => {
				var _e$stopPropagation;
				return e === null || e === void 0 || (_e$stopPropagation = e.stopPropagation) === null || _e$stopPropagation === void 0 ? void 0 : _e$stopPropagation.call(e);
			}
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: "stk-checkbox-cell",
		children: /* @__PURE__ */ jsx("input", {
			type: "checkbox",
			checked: !!checked,
			ref: (el) => {
				if (el) el.indeterminate = !!indeterminate;
			},
			className: "stk-checkbox-native",
			onChange: handleChange,
			onClick: (e) => e.stopPropagation()
		})
	});
}
/**
* Checkbox 工厂函数
*
* 用于快速创建多选框单元格和表头单元格组件。
*
* @param options 配置选项
* @returns 包含 CheckboxCell 和 CheckboxAllCell 组件的对象
*
* @example
* ```tsx
* const { CheckboxCell, CheckboxAllCell } = createCheckboxCell({
*   field: '_isChecked',
*   onChange: (checked, row) => { row._isChecked = checked },
* });
*
* const columns = [
*   {
*     dataIndex: 'checkbox',
*     width: 50,
*     customCell: CheckboxCell,
*     customHeaderCell: CheckboxAllCell,
*   },
*   // ...other columns
* ];
* ```
*/
function createCheckboxCell(options) {
	const field = (options === null || options === void 0 ? void 0 : options.field) ?? "_isChecked";
	const customComponent = options === null || options === void 0 ? void 0 : options.checkboxComponent;
	/** 单元格 Checkbox 组件 - 用于 customCell */
	function CheckboxCell(props) {
		var _props$row;
		const isChecked = !!((_props$row = props.row) === null || _props$row === void 0 ? void 0 : _props$row[field]);
		function handleChange(checked) {
			var _options$onChange;
			props.row[field] = checked;
			options === null || options === void 0 || (_options$onChange = options.onChange) === null || _options$onChange === void 0 || _options$onChange.call(options, checked, props.row);
		}
		return /* @__PURE__ */ jsx(CheckboxView, {
			checked: isChecked,
			customComponent,
			onChange: handleChange
		});
	}
	/** 表头 Checkbox 组件 - 用于 customHeaderCell（全选/半选） */
	function CheckboxAllCell(_props) {
		const ctx = useContext(StkTableContext);
		const dataSource = (ctx === null || ctx === void 0 ? void 0 : ctx.dataSource) || [];
		const isCheckAll = dataSource.length > 0 && dataSource.every((item) => !!item[field]);
		const checkedCount = dataSource.filter((item) => !!item[field]).length;
		const isIndeterminate = checkedCount > 0 && checkedCount < dataSource.length;
		function handleChange(checked) {
			var _options$onSelectAll;
			dataSource.forEach((item) => {
				item[field] = checked;
			});
			options === null || options === void 0 || (_options$onSelectAll = options.onSelectAll) === null || _options$onSelectAll === void 0 || _options$onSelectAll.call(options, checked);
		}
		return /* @__PURE__ */ jsx(CheckboxView, {
			checked: isCheckAll,
			indeterminate: isIndeterminate,
			customComponent,
			onChange: handleChange
		});
	}
	return {
		CheckboxCell,
		CheckboxAllCell
	};
}
//#endregion
export { CELL_KEY_SEPARATE, DEFAULT_COL_WIDTH, DEFAULT_ROW_ACTIVE_CONFIG, DEFAULT_ROW_HEIGHT, DEFAULT_SMOOTH_SCROLL, DEFAULT_SORT_CONFIG, DEFAULT_TABLE_HEIGHT, DEFAULT_TABLE_WIDTH, EXPANDED_ROW_KEY_PREFIX, HIGHLIGHT_CELL_CLASS, HIGHLIGHT_COLOR, HIGHLIGHT_DURATION, HIGHLIGHT_ROW_CLASS, IS_LEGACY_MODE, STK_ID_PREFIX, StkTable, StkTable as default, StkTableContext, TagType, binarySearch, createCheckboxCell, createEditableCell, createFilterCell, insertToOrderedArray, strCompare, tableSort };
