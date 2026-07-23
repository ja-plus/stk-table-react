/**
 * name: stk-table-react
 * version: v1.0.0
 * description: High performance realtime virtual table for React
 * author: japlus
 * homepage: https://ja-plus.github.io/stk-table-react/
 * license: MIT
 */
import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
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
function pureCellKeyGen(rowKey, colKey) {
	return rowKey + "--" + colKey;
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
/**
* 改进的节流函数
*/
function throttle(fn, delay) {
	let timer;
	let lastArgs = null;
	const callFn = () => {
		if (lastArgs) {
			fn(...lastArgs);
			lastArgs = null;
		}
	};
	return function(...args) {
		lastArgs = args;
		if (!timer) {
			callFn();
			timer = self.setTimeout(() => {
				callFn();
				timer = 0;
			}, delay);
		}
	};
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
//#region src/StkTable/hooks/useHighlight.ts
/**
* 高亮单元格，行
* 移植自 stk-table-vue useHighlight.ts
*/
function useHighlight(highlightConfig, theme, stkTableId, tableContainerRef) {
	/**
	* 存放高亮行的状态-使用animation api实现
	* @key 行唯一键
	* @value 记录高亮配置
	*/
	const highlightDimRowsAnimationRef = useRef(/* @__PURE__ */ new Map());
	/** 是否正在计算高亮行的循环 */
	const calcLoopRunningRef = useRef(false);
	/** 高亮后渐暗的行定时器 */
	const highlightDimRowsTimeoutRef = useRef(/* @__PURE__ */ new Map());
	/** 高亮后渐暗的单元格定时器 */
	const highlightDimCellsTimeoutRef = useRef(/* @__PURE__ */ new Map());
	const getHighlightFrom = useCallback(() => HIGHLIGHT_COLOR[theme === "dark" ? "dark" : "light"].from, [theme]);
	const getDefaultOption = useCallback(() => {
		const duration = highlightConfig.duration ? highlightConfig.duration * 1e3 : HIGHLIGHT_DURATION;
		const frequency = highlightConfig.fps && highlightConfig.fps > 0 ? 1e3 / highlightConfig.fps : null;
		const steps = frequency ? Math.round(duration / frequency) : null;
		const keyframe = { backgroundColor: [getHighlightFrom(), ""] };
		if (steps) keyframe.easing = `steps(${steps})`;
		return {
			duration,
			keyframe
		};
	}, [highlightConfig, getHighlightFrom]);
	/**
	* 更新行状态
	* @returns 是否应该从store中删除（ignoreInvisible为true且DOM不存在时返回true）
	*/
	const updateRowAnimation = useCallback((rowKeyValue, store, timeOffset) => {
		const rowEl = document.getElementById(stkTableId + "-" + String(rowKeyValue));
		const { visible, ignoreInvisible } = store;
		if (!rowEl) {
			if (ignoreInvisible) return true;
			if (visible) store.visible = false;
			return false;
		}
		const { keyframe, duration: initialDuration } = store;
		if (!visible) {
			store.visible = true;
			/** 经过的时间 ÷ 高亮持续时间 计算出 颜色过渡进度 (0-1) */
			const iterationStart = timeOffset / initialDuration;
			rowEl.animate(keyframe, {
				duration: initialDuration - timeOffset,
				iterationStart,
				iterations: 1 - iterationStart
			});
		}
		return false;
	}, [stkTableId]);
	/** 计算高亮渐暗颜色的循环 */
	const calcRowHighlightLoop = useCallback(() => {
		if (calcLoopRunningRef.current) return;
		calcLoopRunningRef.current = true;
		const store = highlightDimRowsAnimationRef.current;
		const recursion = () => {
			window.requestAnimationFrame(() => {
				const nowTs = performance.now();
				const keysToDelete = [];
				store.forEach((s, rowKeyValue) => {
					const timeOffset = nowTs - s.ts;
					if (timeOffset < s.duration) {
						if (updateRowAnimation(rowKeyValue, s, timeOffset)) keysToDelete.push(rowKeyValue);
					} else keysToDelete.push(rowKeyValue);
				});
				keysToDelete.forEach((key) => store.delete(key));
				if (store.size) recursion();
				else {
					calcLoopRunningRef.current = false;
					store.clear();
				}
			});
		};
		recursion();
	}, [updateRowAnimation]);
	/** 使用css @keyframes动画，实现高亮行动画 */
	const highlightRowsInCssKeyframe = useCallback((rowKeyValues, className, duration) => {
		let needRepaint = false;
		const rowElTemp = [];
		for (let i = 0; i < rowKeyValues.length; i++) {
			const rowKeyValue = rowKeyValues[i];
			const rowEl = document.getElementById(stkTableId + "-" + String(rowKeyValue));
			if (!rowEl) continue;
			if (rowEl.classList.contains(className)) {
				rowEl.classList.remove(className);
				needRepaint = true;
			}
			rowElTemp.push(rowEl);
			window.clearTimeout(highlightDimRowsTimeoutRef.current.get(rowKeyValue));
			highlightDimRowsTimeoutRef.current.set(rowKeyValue, window.setTimeout(() => {
				rowEl.classList.remove(className);
				highlightDimRowsTimeoutRef.current.delete(rowKeyValue);
			}, duration));
		}
		if (needRepaint) {
			var _tableContainerRef$cu;
			(_tableContainerRef$cu = tableContainerRef.current) === null || _tableContainerRef$cu === void 0 || _tableContainerRef$cu.offsetWidth;
		}
		rowElTemp.forEach((el) => el.classList.add(className));
	}, [stkTableId, tableContainerRef]);
	/** 使用css @keyframes动画，实现高亮单元格动画 */
	const highlightCellsInCssKeyFrame = useCallback((cellEl, rowKeyValue, colKeyValue, className, duration) => {
		if (cellEl.classList.contains(className)) {
			cellEl.classList.remove(className);
			cellEl.offsetHeight;
		}
		cellEl.classList.add(className);
		const cellKey = `${rowKeyValue}-${colKeyValue}`;
		window.clearTimeout(highlightDimCellsTimeoutRef.current.get(cellKey));
		if (!duration) return;
		highlightDimCellsTimeoutRef.current.set(cellKey, window.setTimeout(() => {
			cellEl.classList.remove(className);
			highlightDimCellsTimeoutRef.current.delete(cellKey);
		}, duration));
	}, []);
	return [useCallback((rowKeyValues, option = {}) => {
		if (!Array.isArray(rowKeyValues)) rowKeyValues = [rowKeyValues];
		if (!rowKeyValues.length) return;
		const { className, method, keyframe, duration } = {
			className: HIGHLIGHT_ROW_CLASS,
			method: "animation",
			...getDefaultOption(),
			...option
		};
		const ignoreInvisible = Boolean(option.ignoreInvisible);
		if (method === "animation") {
			const nowTs = performance.now();
			for (let i = 0; i < rowKeyValues.length; i++) {
				const rowKeyValue = rowKeyValues[i];
				const store = {
					ts: nowTs,
					visible: false,
					keyframe,
					duration,
					ignoreInvisible
				};
				const shouldDelete = updateRowAnimation(rowKeyValue, store, 0);
				if (ignoreInvisible && shouldDelete) highlightDimRowsAnimationRef.current.delete(rowKeyValue);
				else highlightDimRowsAnimationRef.current.set(rowKeyValue, store);
			}
			calcRowHighlightLoop();
		} else highlightRowsInCssKeyframe(rowKeyValues, className, duration);
	}, [
		getDefaultOption,
		updateRowAnimation,
		calcRowHighlightLoop,
		highlightRowsInCssKeyframe
	]), useCallback((rowKeyValue, colKeyValue, option = {}) => {
		var _tableContainerRef$cu2;
		const cellEl = (_tableContainerRef$cu2 = tableContainerRef.current) === null || _tableContainerRef$cu2 === void 0 ? void 0 : _tableContainerRef$cu2.querySelector(`[data-row-key="${rowKeyValue}"] [data-col-key="${colKeyValue}"]`);
		if (!cellEl) return;
		const { className, method, duration, keyframe } = {
			className: HIGHLIGHT_CELL_CLASS,
			method: "animation",
			...getDefaultOption(),
			...option
		};
		if (method === "animation") cellEl.animate(keyframe, duration);
		else highlightCellsInCssKeyFrame(cellEl, rowKeyValue, colKeyValue, className, duration);
	}, [
		getDefaultOption,
		highlightCellsInCssKeyFrame,
		tableContainerRef
	])];
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
/** 检测主要指针是否为触摸设备（移动/平板） */
function isTouchPrimaryDevice() {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}
/** 自动滚动：鼠标距容器边缘多少px开始触发 */
var EDGE_ZONE = 40;
/** 自动滚动：每帧最大滚动像素 */
var SCROLL_SPEED_MAX = 15;
var POINT_EDGE_OFFSET = 2;
var KEY_ARROW_UP = "ArrowUp";
var KEY_ARROW_DOWN = "ArrowDown";
var KEY_ARROW_LEFT = "ArrowLeft";
var KEY_ARROW_RIGHT = "ArrowRight";
var KEY_TAB = "Tab";
var KEY_ESCAPE = "Escape";
var KEY_ESC = "Esc";
var KEY_C = "c";
var CELL_RANGE_SELECTED = "cell-range-selected";
var CELL_RANGE_TOP = "cell-range-t";
var CELL_RANGE_BOTTOM = "cell-range-b";
var CELL_RANGE_LEFT = "cell-range-l";
var CELL_RANGE_RIGHT = "cell-range-r";
var ROW_RANGE_SELECTED = "row-range-selected";
/** 空集合常量，避免重复创建 */
var EMPTY_CELL_KEY_SET = /* @__PURE__ */ new Set();
/** 钳制值到指定范围内 */
function clampNum(value, min, max) {
	return Math.max(min, Math.min(value, max));
}
/** 获取归一化（min/max）后的选区范围 */
function normalizeRange(range) {
	const { begin, end } = range.index;
	return {
		minRow: Math.min(begin.row, end.row),
		maxRow: Math.max(begin.row, end.row),
		minCol: Math.min(begin.col, end.col),
		maxCol: Math.max(begin.col, end.col)
	};
}
/** 构造选区范围。begin = 拖拽起点，end = 拖拽终点 */
function makeRange(beginRow, beginCol, endRow, endCol) {
	return { index: {
		x: [beginCol, endCol],
		y: [beginRow, endRow],
		begin: {
			row: beginRow,
			col: beginCol
		},
		end: {
			row: endRow,
			col: endCol
		}
	} };
}
/** 计算自动滚动的增量 */
function calculateAutoScrollDelta(mouseX, mouseY, rect) {
	const { top, bottom, left, right } = rect;
	let deltaX = 0;
	let deltaY = 0;
	if (mouseY < top + EDGE_ZONE) {
		const dist = Math.max(0, top + EDGE_ZONE - mouseY);
		deltaY = -Math.ceil(dist / EDGE_ZONE * SCROLL_SPEED_MAX);
	} else if (mouseY > bottom - EDGE_ZONE) {
		const dist = Math.max(0, mouseY - (bottom - EDGE_ZONE));
		deltaY = Math.ceil(dist / EDGE_ZONE * SCROLL_SPEED_MAX);
	}
	if (mouseX < left + EDGE_ZONE) {
		const dist = Math.max(0, left + EDGE_ZONE - mouseX);
		deltaX = -Math.ceil(dist / EDGE_ZONE * SCROLL_SPEED_MAX);
	} else if (mouseX > right - EDGE_ZONE) {
		const dist = Math.max(0, mouseX - (right - EDGE_ZONE));
		deltaX = Math.ceil(dist / EDGE_ZONE * SCROLL_SPEED_MAX);
	}
	return {
		deltaX,
		deltaY
	};
}
/** 根据按键计算移动方向 */
function getMovementDelta(key, shiftKey) {
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
			colDelta = shiftKey ? -1 : 1;
			break;
	}
	return [rowDelta, colDelta];
}
/** 处理Tab键的换行逻辑 */
function handleTabWrap(row, col, rawCol, rowCount, colCount) {
	if (rawCol >= colCount) return [Math.min(row + 1, rowCount - 1), 0];
	if (rawCol < 0) return [Math.max(row - 1, 0), colCount - 1];
	return [row, col];
}
/**
* StkTable React Component
* A high-performance virtual scrolling table
*/
var StkTable = forwardRef((props, ref) => {
	const { width = "", minWidth = "", maxWidth = "", stripe = false, fixedMode = false, headless = false, theme = "light", rowHeight = 28, autoRowHeight = false, rowHover = true, rowActive = DEFAULT_ROW_ACTIVE_CONFIG, rowCurrentRevokable = true, headerRowHeight = 28, footerRowHeight = 28, virtual = false, virtualX = false, columns = [], dataSource = [], rowKey = "", colKey, emptyCellText = "--", noDataFull = false, showNoData = true, sortRemote = false, showHeaderOverflow = false, showOverflow = false, showTrHoverClass = false, cellHover = false, cellActive = false, selectedCellRevokable = true, areaSelection = false, headerDrag = false, rowClassName = () => "", colResizable = false, colMinWidth = 10, bordered = true, autoResize = true, fixedColShadow = false, sortConfig = DEFAULT_SORT_CONFIG, hideHeaderTitle = false, highlightConfig = {}, seqConfig = {}, expandConfig = {}, dragRowConfig = {}, treeConfig = {}, cellFixedMode = "sticky", smoothScroll = DEFAULT_SMOOTH_SCROLL, scrollRowByRow = false, scrollbar = false, experimental = {}, footerData = [], footerConfig = { position: "bottom" }, renderHeader, renderEmpty, renderExpand, renderCustomBottom, onSortChange, onRowClick, onCurrentChange, onCellSelected, onRowDblclick, onHeaderRowMenu, onRowMenu, onCellClick, onCellMouseenter, onCellMouseleave, onCellMouseover, onCellMousedown, onHeaderCellClick, onScroll, onScrollX, onColOrderChange, onThDragStart: onThDragStartCb, onThDrop: onThDropCb, onRowOrderChange, onColResize, onToggleRowExpand, onToggleTreeExpand, onAreaSelectionChange, onFilterChange, onUpdateColumns, className = "", style } = props;
	const stkTableId = useMemo(() => createStkTableId(), []);
	const tableContainerRef = useRef(null);
	const colResizeIndicatorRef = useRef(null);
	const trRefsMap = useRef(/* @__PURE__ */ new Map());
	const isRelativeMode = IS_LEGACY_MODE ? true : cellFixedMode === "relative";
	const [dataSourceCopy, setDataSourceCopy] = useState([]);
	const [currentRowKey, setCurrentRowKey] = useState();
	const [currentSelectedCellKey, setCurrentSelectedCellKey] = useState();
	const [currentHoverRowKey, setCurrentHoverRowKey] = useState(null);
	const [sortStates, setSortStates] = useState([]);
	const [isColResizing, setIsColResizing] = useState(false);
	const [version, setVersion] = useState(0);
	const [sbThumb, setSbThumb] = useState({
		h: 0,
		w: 0,
		t: 0,
		l: 0
	});
	const [showScrollbar, setShowScrollbar] = useState({
		x: false,
		y: false
	});
	const [isDragScroll, setIsDragScroll] = useState(false);
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
	/** 横向虚拟滚动列宽缓存，避免每次滚动都 O(n) 构建 */
	const colWidthCacheRef = useRef({
		cols: null,
		nonFixedCols: [],
		leftFixedCols: []
	});
	useRef(false);
	useRef(0);
	const scrollRAFScheduledRef = useRef(false);
	/** 自定义滚动条拖动状态 */
	const sbDragRef = useRef({
		isVertical: false,
		isHorizontal: false,
		startY: 0,
		startX: 0,
		startTop: 0,
		startLeft: 0
	});
	const sbDragHandlerRef = useRef(void 0);
	const isMobileDeviceRef = useRef(false);
	/** scroll-row-by-row 拖动结束 debounce 定时器 */
	const srbrDebounceRef = useRef(0);
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
	/**
	* 从 ref 读取最新的末级表头。
	* 用于 setSorter/sortData 等回调，避免挂载阶段（如 defaultSort）闭包捕获到尚未填充的 tableHeaderLast。
	*/
	const getTableHeaderLast = useCallback(() => {
		return tableHeadersForCalcRef.current.slice(-1)[0] || [];
	}, []);
	const tableHeaders = useMemo(() => tableHeadersRef.current, [version]);
	const isTreeData = useMemo(() => columns.some((col) => col.type === "tree-node"), [columns]);
	const hasExpandCol = useMemo(() => tableHeaderLast.some((col) => col.type === "expand"), [tableHeaderLast]);
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
	/** 获取行高函数：autoRowHeight 时返回测量/预估高度，展开行返回配置高度 */
	const getRowHeightFn = useMemo(() => {
		const baseRowHeight = rowHeight || 28;
		let fn = () => baseRowHeight;
		if (autoRowHeight) {
			const temp = fn;
			fn = (r) => {
				if (r) {
					const stored = autoRowHeightMapRef.current.get(String(rowKeyGen(r)));
					if (stored) return stored;
				}
				const expectedHeight = autoRowHeight === null || autoRowHeight === void 0 ? void 0 : autoRowHeight.expectedHeight;
				if (expectedHeight) {
					if (typeof expectedHeight === "function") return r ? expectedHeight(r) : temp(r);
					return expectedHeight;
				}
				return temp(r);
			};
		}
		if (hasExpandCol) {
			const expandedRowHeight = expandConfig === null || expandConfig === void 0 ? void 0 : expandConfig.height;
			const temp = fn;
			fn = (r) => r && r.__EXP_R__ && expandedRowHeight ? expandedRowHeight : temp(r);
		}
		return fn;
	}, [
		rowHeight,
		autoRowHeight,
		hasExpandCol,
		expandConfig,
		rowKeyGen
	]);
	const virtual_offsetBottom = useMemo(() => {
		if (!virtual_on) return 0;
		const { startIndex, endIndex } = virtualScrollRef.current;
		if (autoRowHeight || hasExpandCol) {
			let offsetBottom = 0;
			for (let i = endIndex + 1; i < dataSourceCopy.length; i++) offsetBottom += getRowHeightFn(dataSourceCopy[i]);
			return offsetBottom;
		}
		const rh = virtualScrollRef.current.rowHeight;
		return (dataSourceCopy.length - startIndex - virtual_dataSourcePart.length) * rh;
	}, [
		virtual_on,
		dataSourceCopy,
		virtual_dataSourcePart,
		version,
		autoRowHeight,
		hasExpandCol,
		getRowHeightFn
	]);
	const virtualX_on = useMemo(() => {
		if (!virtualX) return false;
		return tableHeaderLast.reduce((sum, col) => sum + getCalculatedColWidth(col), 0) > virtualScrollXRef.current.containerWidth + 100;
	}, [
		virtualX,
		tableHeaderLast,
		version
	]);
	/** 是否多级表头 */
	const isMultiLevelHeader = useMemo(() => tableHeaders.length > 1, [tableHeaders]);
	/**
	* 多级表头横向虚拟滚动参数：以顶层列组为单位计算开始/结束位置。
	* - 只有整个顶层组完全滚出视口时才移除（避免 colSpan 变化导致抖动）。
	* - 单级表头时退化为与 tbody 相同的参数。
	*/
	const theadVirtualX = useMemo(() => {
		if (!virtualX_on || !isMultiLevelHeader) return {
			startIndex: virtualScrollXRef.current.startIndex,
			endIndex: virtualScrollXRef.current.endIndex,
			offsetLeft: virtualScrollXRef.current.offsetLeft
		};
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
			if (col.fixed === "left" || col.fixed === "right") continue;
			const groupWidth = col.__W__ || getCalculatedColWidth(col);
			const groupRight = cumLeft + groupWidth;
			if (!foundStart && groupRight > scrollLeft) {
				foundStart = true;
				theadStartIndex = col.__LF_S__ ?? 0;
				theadOffsetLeft = cumLeft;
			}
			cumLeft = groupRight;
			theadEndIndex = col.__LF_E__ ?? totalLeafCount;
			if (foundStart && groupRight >= scrollLeft + containerWidth) break;
		}
		if (!foundStart) {
			theadStartIndex = totalLeafCount;
			theadOffsetLeft = cumLeft;
		}
		return {
			startIndex: theadStartIndex,
			endIndex: theadEndIndex,
			offsetLeft: theadOffsetLeft
		};
	}, [
		virtualX_on,
		isMultiLevelHeader,
		tableHeaders,
		tableHeaderLast,
		version
	]);
	const virtualX_columnPart = useMemo(() => {
		if (virtualX_on) {
			const { startIndex, endIndex } = virtualScrollXRef.current;
			const maxIndex = tableHeaderLast.length;
			const validEndIndex = Math.min(endIndex, maxIndex);
			const validStartIndex = Math.min(startIndex, maxIndex);
			if (isMultiLevelHeader) {
				const leftFixedCols = [];
				const rightFixedCols = [];
				const visibleCols = [];
				for (let i = 0; i < tableHeaderLast.length; i++) {
					const col = tableHeaderLast[i];
					if (col.fixed === "right") rightFixedCols.push(col);
					else if (col.fixed === "left") leftFixedCols.push(col);
					else if (i >= validStartIndex && i < validEndIndex) visibleCols.push(col);
				}
				const result = [];
				result.push(...leftFixedCols);
				const theadStart = theadVirtualX.startIndex;
				const leftSpacerColspan = Math.max(0, startIndex - theadStart);
				if (leftSpacerColspan) result.push({ __VT_C_SP__: leftSpacerColspan });
				result.push(...visibleCols);
				const rightSpacerColspan = Math.max(0, theadVirtualX.endIndex - endIndex);
				if (rightSpacerColspan) result.push({ __VT_C_SP__: rightSpacerColspan });
				result.push(...rightFixedCols);
				return result;
			}
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
		isMultiLevelHeader,
		theadVirtualX,
		tableHeaderLast,
		version
	]);
	/**
	* 表头横向虚拟滚动：
	* - 单级表头：最后一行使用 virtualX_columnPart，其他行原样返回。
	* - 多级表头：按顶层组粒度过滤（整个组滚出才移除），保持 colSpan 稳定。
	*/
	const virtualX_tableHeaders = useMemo(() => {
		if (!virtualX_on) return tableHeaders;
		if (isMultiLevelHeader) {
			const { startIndex, endIndex } = theadVirtualX;
			return tableHeaders.map((row) => {
				return row.filter((col) => {
					if (col.fixed === "left" || col.fixed === "right") return true;
					const leafStart = col.__LF_S__ ?? 0;
					return (col.__LF_E__ ?? leafStart + 1) > startIndex && leafStart < endIndex;
				});
			});
		}
		return tableHeaders.map((row, i) => i === tableHeaders.length - 1 ? virtualX_columnPart : row);
	}, [
		virtualX_on,
		isMultiLevelHeader,
		theadVirtualX,
		tableHeaders,
		virtualX_columnPart
	]);
	/** 展开行 colspan：虚拟滚动时等于所有 td 元素数量（含 spacer）之和 */
	const expandRowColspan = useMemo(() => {
		if (!virtualX_on) return tableHeaderLast.length;
		const spacers = virtualX_columnPart.filter((c) => c.__VT_C_SP__);
		return 2 + virtualX_columnPart.length + spacers.reduce((sum, s) => sum + Math.max(0, (s.__VT_C_SP__ ?? 0) - 1), 0);
	}, [
		virtualX_on,
		virtualX_columnPart,
		tableHeaderLast
	]);
	const virtualX_offsetRight = useMemo(() => {
		if (!virtualX_on) return 0;
		const endIndex = isMultiLevelHeader ? theadVirtualX.endIndex : virtualScrollXRef.current.endIndex;
		let w = 0;
		for (let i = endIndex; i < tableHeaderLast.length; i++) {
			const col = tableHeaderLast[i];
			if (col.fixed !== "right") w += getCalculatedColWidth(col);
		}
		return w;
	}, [
		virtualX_on,
		isMultiLevelHeader,
		theadVirtualX,
		tableHeaderLast,
		version
	]);
	const mergeCellsInfo = useMemo(() => {
		const hiddenCellMap = /* @__PURE__ */ new Map();
		const mergeSpanMap = /* @__PURE__ */ new Map();
		/** rowKey -> 覆盖该行的合并单元格(起始格)cellKey 集合，hover/active 该行时同步高亮对应 rowspan 单元格（key 统一为字符串，兼容数字 key） */
		const hoverRowMap = /* @__PURE__ */ new Map();
		/** 合并单元格 cellKey -> 起始格位置(rowKey, colKey)，用于定位对应 dom */
		const mergeCellPosMap = /* @__PURE__ */ new Map();
		const headers = tableHeaderLast;
		if (!headers.some((c) => c.mergeCells)) return {
			hiddenCellMap,
			mergeSpanMap,
			hoverRowMap,
			mergeCellPosMap
		};
		const colIndexCache = /* @__PURE__ */ new Map();
		const hideCells = (rowKey, colKey, colspan, isSelfRow, mergeCellKey) => {
			let startIndex = colIndexCache.get(colKey);
			if (startIndex === void 0) {
				startIndex = headers.findIndex((item) => colKeyGen(item) === colKey);
				if (startIndex < 0) return;
				colIndexCache.set(colKey, startIndex);
			}
			let hiddenSet = hiddenCellMap.get(rowKey);
			if (!hiddenSet) {
				hiddenSet = /* @__PURE__ */ new Set();
				hiddenCellMap.set(rowKey, hiddenSet);
			}
			let hoverSet = hoverRowMap.get(String(rowKey));
			if (!hoverSet) {
				hoverSet = /* @__PURE__ */ new Set();
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
				let { colspan, rowspan } = col.mergeCells({
					row,
					col,
					rowIndex,
					colIndex
				}) || {};
				colspan = colspan || 1;
				rowspan = rowspan || 1;
				if (colspan === 1 && rowspan === 1) continue;
				const rowKey = rowKeyGen(row);
				const colKey = colKeyGen(col);
				const mergedCellKey = pureCellKeyGen(rowKey, colKey);
				mergeCellPosMap.set(mergedCellKey, {
					rowKey,
					colKey
				});
				for (let i = rowIndex; i < rowIndex + rowspan; i++) {
					const targetRow = virtual_dataSourcePart[i];
					if (!targetRow) break;
					hideCells(rowKeyGen(targetRow), colKey, colspan, i === rowIndex, mergedCellKey);
				}
				mergeSpanMap.set(mergedCellKey, {
					colspan,
					rowspan
				});
			}
		}
		return {
			hiddenCellMap,
			mergeSpanMap,
			hoverRowMap,
			mergeCellPosMap
		};
	}, [
		virtual_dataSourcePart,
		tableHeaderLast,
		colKeyGen,
		rowKeyGen
	]);
	/** 行激活时需要高亮的合并单元格集合（rowspan 覆盖当前激活行的起始格） */
	const activeMergedCells = rowActiveProp.enabled && currentRowKey != null ? mergeCellsInfo.hoverRowMap.get(String(currentRowKey)) || EMPTY_CELL_KEY_SET : EMPTY_CELL_KEY_SET;
	useMemo(() => {
		maxRowSpanRef.current.clear();
		const headers = tableHeaderLast;
		if (!headers.some((c) => c.mergeCells)) return;
		for (let rowIndex = 0; rowIndex < dataSourceCopy.length; rowIndex++) {
			const row = dataSourceCopy[rowIndex];
			if (!row || row.__EXP_R__) continue;
			let maxRowSpan = 1;
			for (let colIndex = 0; colIndex < headers.length; colIndex++) {
				const col = headers[colIndex];
				if (!col.mergeCells) continue;
				const { rowspan } = col.mergeCells({
					row,
					col,
					rowIndex,
					colIndex
				}) || {};
				if (rowspan && rowspan > maxRowSpan) maxRowSpan = rowspan;
			}
			if (maxRowSpan > 1) maxRowSpanRef.current.set(rowKeyGen(row), maxRowSpan);
		}
	}, [
		dataSourceCopy,
		tableHeaderLast,
		rowKeyGen
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
	const fixedColsRef = useRef([]);
	const fixedShadowColsRef = useRef([]);
	/** 滚动条变化时，更新需要展示阴影的列 */
	const updateFixedShadow = useCallback(() => {
		const fixedColsTemp = [];
		let clientWidth;
		let scrollLeft;
		if (virtualX_on) {
			const { containerWidth: cw, scrollLeft: sl } = virtualScrollXRef.current;
			clientWidth = cw;
			scrollLeft = sl;
		} else {
			const el = tableContainerRef.current;
			clientWidth = (el === null || el === void 0 ? void 0 : el.clientWidth) || 0;
			scrollLeft = (el === null || el === void 0 ? void 0 : el.scrollLeft) || 0;
		}
		/** 左侧需要展示阴影的列 */
		const leftShadowCol = [];
		/** 右侧展示阴影的列 */
		const rightShadowCol = [];
		const headers = tableHeadersForCalcRef.current;
		for (let level = 0; level < headers.length; level++) {
			const row = headers[level];
			let left = 0;
			for (let i = 0, rowLen = row.length; i < rowLen; i++) {
				const col = row[i];
				const position = getFixedColPosition(col);
				const isFixedLeft = col.fixed === "left";
				const isFixedRight = col.fixed === "right";
				if (isFixedLeft && position + scrollLeft > left) {
					fixedColsTemp.push(col);
					leftShadowCol[level] = col;
				}
				left += getCalculatedColWidth(col);
				if (isFixedRight && scrollLeft + clientWidth - left < position) {
					fixedColsTemp.push(col);
					if (!rightShadowCol[level]) rightShadowCol[level] = col;
				}
			}
		}
		if (fixedColShadow) fixedShadowColsRef.current = leftShadowCol.concat(rightShadowCol).filter(Boolean);
		fixedColsRef.current = fixedColsTemp;
	}, [
		virtualX_on,
		getFixedColPosition,
		fixedColShadow
	]);
	const fixedColClassMap = useMemo(() => {
		const colMap = /* @__PURE__ */ new Map();
		const fixedShadowColsValue = fixedShadowColsRef.current;
		const fixedColsValue = fixedColsRef.current;
		const headers = tableHeadersRef.current;
		for (let i = 0; i < headers.length; i++) {
			const cols = headers[i];
			for (let j = 0; j < cols.length; j++) {
				const col = cols[j];
				const fixed = col.fixed;
				const showShadow = fixed && fixedColShadow && fixedShadowColsValue.includes(col);
				const classList = [];
				if (fixedColsValue.includes(col)) classList.push("fixed-cell--active");
				if (fixed) {
					classList.push("fixed-cell");
					classList.push("fixed-cell--" + fixed);
				}
				if (showShadow) classList.push("fixed-cell--shadow");
				colMap.set(colKeyGen(col), classList);
			}
		}
		return colMap;
	}, [
		version,
		colKeyGen,
		fixedColShadow
	]);
	const getColumnSortState = useCallback((colKeyVal) => {
		return sortStates.find((s) => s.key === colKeyVal || s.dataIndex === colKeyVal);
	}, [sortStates]);
	const sortData = useCallback((data, states) => {
		const st = states ?? sortStates;
		if (!st.length) return data;
		const sc = {
			...DEFAULT_SORT_CONFIG,
			...sortConfig
		};
		let result = data.slice();
		for (let i = st.length - 1; i >= 0; i--) {
			const state = st[i];
			const col = getTableHeaderLast().find((c) => state.key && colKeyGen(c) === state.key || c.dataIndex === state.dataIndex);
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
		getTableHeaderLast,
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
		const rh = getRowHeightFn();
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
		let startIndex = 0;
		let endIndex = dataLength;
		let autoRowHeightTop = 0;
		if (autoRowHeight || hasExpandCol) {
			if (autoRowHeight) trRefsMap.current.forEach((tr, rowKey) => {
				if (!rowKey || autoRowHeightMapRef.current.has(rowKey)) return;
				autoRowHeightMapRef.current.set(rowKey, tr.offsetHeight);
			});
			for (let i = 0; i < dataLength; i++) {
				const height = getRowHeightFn(dataSourceCopy[i]);
				autoRowHeightTop += height;
				if (autoRowHeightTop >= sTop) {
					startIndex = i;
					autoRowHeightTop -= height;
					break;
				}
			}
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
		if (maxRowSpanRef.current.size) {
			const rawStartIndex = startIndex;
			let correctedStartIndex = startIndex;
			let correctedEndIndex = endIndex;
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
			for (let i = correctedStartIndex; i < correctedEndIndex; i++) {
				const row = dataSourceCopy[i];
				if (!row) continue;
				const spanEndIndex = i + (maxRowSpanRef.current.get(rowKeyGen(row)) || 1);
				if (spanEndIndex > correctedEndIndex) correctedEndIndex = spanEndIndex;
			}
			startIndex = correctedStartIndex;
			endIndex = correctedEndIndex;
			if ((autoRowHeight || hasExpandCol) && startIndex !== rawStartIndex) {
				autoRowHeightTop = 0;
				for (let i = 0; i < startIndex; i++) autoRowHeightTop += getRowHeightFn(dataSourceCopy[i]);
			}
		}
		if (stripe && !isExperimentalScrollY && startIndex > 0 && startIndex % 2) {
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
		if (autoRowHeight || hasExpandCol) offsetTop = autoRowHeightTop;
		else offsetTop = startIndex * rh;
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
		rowKeyGen,
		getRowHeightFn,
		autoRowHeight,
		hasExpandCol
	]);
	const getColWidthCache = useCallback((cols) => {
		const cache = colWidthCacheRef.current;
		if (cache.cols === cols) return cache;
		const nonFixedCols = [];
		const leftFixedCols = [];
		let cumWidth = 0;
		for (let i = 0; i < cols.length; i++) {
			const col = cols[i];
			const w = getCalculatedColWidth(col);
			if (col.fixed === "left") {
				leftFixedCols.push({
					index: i,
					width: w
				});
				continue;
			}
			cumWidth += w;
			nonFixedCols.push({
				index: i,
				cumWidth
			});
		}
		const newCache = {
			cols,
			nonFixedCols,
			leftFixedCols
		};
		colWidthCacheRef.current = newCache;
		return newCache;
	}, []);
	const updateVirtualScrollX = useCallback((sLeft = 0) => {
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
		const { nonFixedCols, leftFixedCols } = getColWidthCache(tableHeaderLastValue);
		if (nonFixedCols.length > 0 && sLeft > 0) {
			const found = binarySearch(nonFixedCols, (mid) => {
				return nonFixedCols[mid].cumWidth <= sLeft ? -1 : 1;
			});
			const idx = Math.min(found, nonFixedCols.length - 1);
			startIndex = nonFixedCols[idx].index;
			offsetLeft = idx > 0 ? nonFixedCols[idx - 1].cumWidth : 0;
			leftFirstColRestWidth = nonFixedCols[idx].cumWidth - sLeft;
		} else if (nonFixedCols.length > 0) startIndex = nonFixedCols[0].index;
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
			if (endColWidthSum >= containerW) {
				endIndex = colIndex + 1;
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
	}, [
		virtualX,
		tableHeaderLast,
		getColWidthCache
	]);
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
		let totalContentHeight = dataSourceCopy.length * rh + tableHeaderHeight;
		if (autoRowHeight || hasExpandCol) {
			totalContentHeight = tableHeaderHeight;
			for (let i = 0; i < dataSourceCopy.length; i++) totalContentHeight += getRowHeightFn(dataSourceCopy[i]);
		}
		const maxScrollTop = Math.max(0, totalContentHeight - containerHeight);
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
		updateVirtualScrollY,
		autoRowHeight,
		hasExpandCol,
		getRowHeightFn
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
	const onlyDragScroll = scrollRowByRow === "scrollbar";
	/** 是否启用按行滚动 */
	const isSRBRActive = onlyDragScroll ? isDragScroll : !!scrollRowByRow;
	/** scroll-row-by-row 总高度 */
	const SRBRTotalHeight = useMemo(() => {
		if (!isSRBRActive || !virtual) return 0;
		return dataSourceCopy.length * virtualScrollRef.current.rowHeight + tableHeaderHeight;
	}, [
		isSRBRActive,
		virtual,
		dataSourceCopy,
		tableHeaderHeight,
		version
	]);
	const SRBRBottomHeight = useMemo(() => {
		if (!isSRBRActive || !virtual) return 0;
		const { containerHeight, rowHeight: rh } = virtualScrollRef.current;
		return (containerHeight - tableHeaderHeight) % rh;
	}, [
		isSRBRActive,
		virtual,
		tableHeaderHeight,
		version
	]);
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
			t = Math.round(scrollTop / (scrollHeight - containerHeight) * (containerHeight - h));
		}
		if (needHorizontal) {
			const ratio = containerWidth / scrollWidth;
			w = Math.max(scrollbarOptions.minWidth, ratio * containerWidth);
			l = Math.round(scrollLeft / (scrollWidth - containerWidth) * (containerWidth - w));
		}
		setShowScrollbar({
			x: needHorizontal,
			y: needVertical
		});
		setSbThumb({
			h,
			w,
			t,
			l
		});
	}, [scrollbarOptions]);
	const onSbDragEnd = useCallback(() => {
		sbDragRef.current.isVertical = false;
		sbDragRef.current.isHorizontal = false;
		if (sbDragHandlerRef.current) {
			document.removeEventListener("mousemove", sbDragHandlerRef.current);
			document.removeEventListener("touchmove", sbDragHandlerRef.current);
			sbDragHandlerRef.current = void 0;
		}
		document.removeEventListener("mouseup", onSbDragEnd);
		document.removeEventListener("touchend", onSbDragEnd);
	}, []);
	const addSbDragListeners = useCallback((dragHandler) => {
		if (sbDragHandlerRef.current) {
			document.removeEventListener("mousemove", sbDragHandlerRef.current);
			document.removeEventListener("touchmove", sbDragHandlerRef.current);
		}
		sbDragHandlerRef.current = dragHandler;
		document.addEventListener("mousemove", dragHandler);
		document.addEventListener("mouseup", onSbDragEnd);
		document.addEventListener("touchmove", dragHandler, { passive: false });
		document.addEventListener("touchend", onSbDragEnd);
	}, [onSbDragEnd]);
	const onVerticalSbDrag = useCallback((e) => {
		if (!sbDragRef.current.isVertical) return;
		e.preventDefault();
		const deltaY = (e instanceof MouseEvent ? e.clientY : e.touches[0].clientY) - sbDragRef.current.startY;
		const { scrollHeight, containerHeight } = virtualScrollRef.current;
		const scrollRange = scrollHeight - containerHeight;
		const scrollDelta = deltaY / (containerHeight - sbThumb.h) * scrollRange;
		if (isExperimentalScrollY) {
			const ratio = containerHeight / scrollHeight;
			const top = Math.round((sbDragRef.current.startTop + scrollDelta) * ratio);
			const maxTop = containerHeight - sbThumb.h;
			setSbThumb((prev) => ({
				...prev,
				t: top < 0 ? 0 : top > maxTop ? maxTop : top
			}));
			updateVirtualScrollY(sbDragRef.current.startTop + scrollDelta);
			setVersion((v) => v + 1);
		} else tableContainerRef.current.scrollTop = sbDragRef.current.startTop + scrollDelta;
	}, [
		sbThumb.h,
		isExperimentalScrollY,
		updateVirtualScrollY
	]);
	const onHorizontalSbDrag = useCallback((e) => {
		if (!sbDragRef.current.isHorizontal) return;
		e.preventDefault();
		const deltaX = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX) - sbDragRef.current.startX;
		const { scrollWidth, containerWidth } = virtualScrollXRef.current;
		const scrollRange = scrollWidth - containerWidth;
		const scrollDelta = deltaX / (containerWidth - sbThumb.w) * scrollRange;
		tableContainerRef.current.scrollLeft = sbDragRef.current.startLeft + scrollDelta;
	}, [sbThumb.w]);
	const onVerticalScrollbarMouseDown = useCallback((e) => {
		if (e.type === "mousedown") e.preventDefault();
		sbDragRef.current.isVertical = true;
		sbDragRef.current.startTop = virtualScrollRef.current.scrollTop;
		const native = e.nativeEvent;
		sbDragRef.current.startY = native instanceof MouseEvent ? native.clientY : native.touches[0].clientY;
		addSbDragListeners(onVerticalSbDrag);
	}, [addSbDragListeners, onVerticalSbDrag]);
	const onHorizontalScrollbarMouseDown = useCallback((e) => {
		if (e.type === "mousedown") e.preventDefault();
		sbDragRef.current.isHorizontal = true;
		sbDragRef.current.startLeft = virtualScrollXRef.current.scrollLeft;
		const native = e.nativeEvent;
		sbDragRef.current.startX = native instanceof MouseEvent ? native.clientX : native.touches[0].clientX;
		addSbDragListeners(onHorizontalSbDrag);
	}, [addSbDragListeners, onHorizontalSbDrag]);
	const scrollTo = useCallback((top = 0, left = 0) => {
		const container = tableContainerRef.current;
		if (!container) return;
		if (top !== null) if (isExperimentalScrollY) {
			updateVirtualScrollY(top);
			setVersion((v) => v + 1);
		} else container.scrollTop = top;
		if (left !== null) container.scrollLeft = left;
	}, [isExperimentalScrollY, updateVirtualScrollY]);
	/** areaSelection 配置归一化 */
	const areaSelectionConfig = useMemo(() => {
		if (typeof areaSelection === "boolean") {
			const b = areaSelection;
			return {
				enabled: b,
				keyboard: b,
				ctrl: b,
				shift: b,
				highlight: {
					cell: b,
					row: false
				}
			};
		}
		const { highlight: userHighlight, ...restConfig } = areaSelection || {};
		return {
			enabled: true,
			ctrl: true,
			shift: true,
			highlight: {
				cell: true,
				row: false,
				...userHighlight
			},
			...restConfig
		};
	}, [areaSelection]);
	const [isAreaSelecting, setIsAreaSelecting] = useState(false);
	const isAreaSelectingRef = useRef(false);
	const selectionRangesRef = useRef([]);
	const anchorCellRef = useRef(null);
	const autoScrollRafIdRef = useRef(0);
	const lastMouseRef = useRef({
		x: 0,
		y: 0
	});
	const selectedCellKeysRef = useRef(/* @__PURE__ */ new Set());
	const areaSelDocListenersRef = useRef(null);
	/** colKey → 绝对索引映射 */
	const colKeyToIndexMap = useMemo(() => {
		const map = /* @__PURE__ */ new Map();
		for (let i = 0; i < tableHeaderLast.length; i++) map.set(colKeyGen(tableHeaderLast[i]), i);
		return map;
	}, [tableHeaderLast, colKeyGen]);
	/**
	* 预计算每个列索引位置对应的左右固定列累计宽度
	* @returns (colIndex) => [leftFixedWidth, rightFixedWidth]
	*/
	const getFixedColWidths = useMemo(() => {
		const cols = tableHeaderLast;
		const leftWidths = new Array(cols.length + 1).fill(0);
		const rightWidths = new Array(cols.length + 1).fill(0);
		let leftSum = 0;
		for (let i = 0; i < cols.length; i++) {
			var _cols$i;
			leftWidths[i] = leftSum;
			if (((_cols$i = cols[i]) === null || _cols$i === void 0 ? void 0 : _cols$i.fixed) === "left") leftSum += getCalculatedColWidth(cols[i]);
		}
		leftWidths[cols.length] = leftSum;
		let rightSum = 0;
		for (let i = cols.length - 1; i >= 0; i--) {
			var _cols$i2;
			rightWidths[i] = rightSum;
			if (((_cols$i2 = cols[i]) === null || _cols$i2 === void 0 ? void 0 : _cols$i2.fixed) === "right") rightSum += getCalculatedColWidth(cols[i]);
		}
		return (colIndex) => {
			return [leftWidths[colIndex] ?? 0, rightWidths[colIndex + 1] ?? 0];
		};
	}, [tableHeaderLast]);
	function emitSelectionChange() {
		onAreaSelectionChange === null || onAreaSelectionChange === void 0 || onAreaSelectionChange(selectionRangesRef.current);
	}
	/**
	* 直接操作 DOM 更新选区样式（不触发 React re-render）
	* 避免拖选时频繁触发整个表格重渲染
	*/
	function updateSelectionDOM() {
		var _areaSelectionConfig$, _areaSelectionConfig$2;
		const container = tableContainerRef.current;
		if (!container) return;
		const cellHighlight = (_areaSelectionConfig$ = areaSelectionConfig.highlight) === null || _areaSelectionConfig$ === void 0 ? void 0 : _areaSelectionConfig$.cell;
		const rowHighlight = (_areaSelectionConfig$2 = areaSelectionConfig.highlight) === null || _areaSelectionConfig$2 === void 0 ? void 0 : _areaSelectionConfig$2.row;
		const oldSelectedCells = container.querySelectorAll(`.${CELL_RANGE_SELECTED}`);
		for (let i = 0; i < oldSelectedCells.length; i++) oldSelectedCells[i].classList.remove(CELL_RANGE_SELECTED, CELL_RANGE_TOP, CELL_RANGE_BOTTOM, CELL_RANGE_LEFT, CELL_RANGE_RIGHT);
		const oldSelectedRows = container.querySelectorAll(`.${ROW_RANGE_SELECTED}`);
		for (let i = 0; i < oldSelectedRows.length; i++) oldSelectedRows[i].classList.remove(ROW_RANGE_SELECTED);
		const ranges = selectionRangesRef.current;
		const keys = /* @__PURE__ */ new Set();
		if (ranges.length) for (const range of ranges) {
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
		selectedCellKeysRef.current = keys;
		if (!ranges.length) return;
		const tbody = container.querySelector(".stk-tbody-main");
		if (!tbody) return;
		if (rowHighlight) for (const range of ranges) {
			const { minRow, maxRow } = normalizeRange(range);
			for (let r = minRow; r <= maxRow; r++) {
				const tr = tbody.querySelector(`tr[data-row-i="${r}"]`);
				if (tr) tr.classList.add(ROW_RANGE_SELECTED);
			}
		}
		if (cellHighlight) {
			const lastRange = ranges[ranges.length - 1];
			const { minRow: lrMinRow, maxRow: lrMaxRow, minCol: lrMinCol, maxCol: lrMaxCol } = normalizeRange(lastRange);
			const trs = tbody.querySelectorAll("tr[data-row-i]");
			for (let t = 0; t < trs.length; t++) {
				const tr = trs[t];
				const rowIndex = parseInt(tr.getAttribute("data-row-i"), 10);
				let inAnyRange = false;
				for (const range of ranges) {
					const { minRow, maxRow } = normalizeRange(range);
					if (rowIndex >= minRow && rowIndex <= maxRow) {
						inAnyRange = true;
						break;
					}
				}
				if (!inAnyRange) continue;
				const tds = tr.querySelectorAll("td[data-col-key]");
				for (let d = 0; d < tds.length; d++) {
					const td = tds[d];
					const colKey = td.getAttribute("data-col-key");
					const colIndex = colKeyToIndexMap.get(colKey);
					if (colIndex === void 0 || colIndex < 0) continue;
					const row = dataSourceCopy[rowIndex];
					const col = tableHeaderLast[colIndex];
					if (!row || !col) continue;
					const ck = cellKeyGen(row, col);
					if (!keys.has(ck)) continue;
					td.classList.add(CELL_RANGE_SELECTED);
					if (rowIndex >= lrMinRow && rowIndex <= lrMaxRow && colIndex >= lrMinCol && colIndex <= lrMaxCol) {
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
	function updateSelectionEnd(endRowIndex, endColIndex) {
		const anchor = anchorCellRef.current;
		if (!anchor) return;
		const newRange = makeRange(anchor.rowIndex, anchor.colIndex, endRowIndex, endColIndex);
		const ranges = [...selectionRangesRef.current];
		if (ranges.length > 0) ranges[ranges.length - 1] = newRange;
		else ranges.push(newRange);
		selectionRangesRef.current = ranges;
		updateSelectionDOM();
	}
	/** 从 MouseEvent 目标元素更新选区 */
	function updateSelectionFromEvent(e) {
		const target = e.target;
		if (!target) return;
		const rowIndex = getClosestTrIndex(target);
		if (Number.isNaN(rowIndex) || rowIndex < 0) return;
		const colKey = getClosestColKey(target);
		const colIndex = colKey ? colKeyToIndexMap.get(colKey) ?? -1 : -1;
		if (colIndex < 0) return;
		updateSelectionEnd(rowIndex, colIndex);
	}
	/** 停止自动滚动 */
	function stopAutoScroll() {
		if (autoScrollRafIdRef.current) {
			cancelAnimationFrame(autoScrollRafIdRef.current);
			autoScrollRafIdRef.current = 0;
		}
	}
	/** 将鼠标位置钳制到容器内部，用 elementFromPoint 找到边缘单元格并更新选区 */
	function updateSelectionFromPoint(container, containerRect) {
		const thead = container.querySelector("thead");
		const { top, bottom, left, right } = containerRect;
		const headerBottom = thead ? top + thead.offsetHeight : top;
		const x = Math.max(left + POINT_EDGE_OFFSET, Math.min(lastMouseRef.current.x, right - POINT_EDGE_OFFSET));
		const y = Math.max(headerBottom + POINT_EDGE_OFFSET, Math.min(lastMouseRef.current.y, bottom - POINT_EDGE_OFFSET));
		const el = document.elementFromPoint(x, y);
		if (!el) return;
		const td = getClosestTd(el);
		const tr = getClosestTr(el);
		if (!td || !tr) return;
		const rowIndex = getClosestTrIndex(tr);
		const colKey = getClosestColKey(td);
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
			updateSelectionFromPoint(container, rect);
		}
		if (isAreaSelectingRef.current && (deltaX !== 0 || deltaY !== 0)) autoScrollRafIdRef.current = requestAnimationFrame(autoScrollLoop);
		else autoScrollRafIdRef.current = 0;
	}
	/** 检查鼠标是否在容器边缘附近，启动或停止自动滚动 */
	function checkAutoScroll() {
		const container = tableContainerRef.current;
		if (!container) return;
		const { top, bottom, left, right } = container.getBoundingClientRect();
		const nearEdge = lastMouseRef.current.y < top + EDGE_ZONE || lastMouseRef.current.y > bottom - EDGE_ZONE || lastMouseRef.current.x < left + EDGE_ZONE || lastMouseRef.current.x > right - EDGE_ZONE;
		if (nearEdge && !autoScrollRafIdRef.current) autoScrollLoop();
		else if (!nearEdge && autoScrollRafIdRef.current) stopAutoScroll();
	}
	/** document mousemove 处理：更新选区终点 + 检测边界自动滚动 */
	function onDocumentMouseMove(e) {
		if (!isAreaSelectingRef.current) return;
		lastMouseRef.current = {
			x: e.clientX,
			y: e.clientY
		};
		updateSelectionFromEvent(e);
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
			document.removeEventListener("mousemove", l.mm);
			document.removeEventListener("mouseup", l.mu);
			areaSelDocListenersRef.current = null;
		}
		emitSelectionChange();
	}
	/** mousedown 处理：设置锚点，开始拖选 */
	function onSelectionMouseDown(e) {
		if (!areaSelectionConfig.enabled || e.button !== 0) return;
		const rowIndex = getClosestTrIndex(e.target);
		const colKey = getClosestColKey(e.target);
		const colIndex = colKey ? colKeyToIndexMap.get(colKey) ?? -1 : -1;
		if (Number.isNaN(rowIndex) || rowIndex < 0 || colIndex < 0) return;
		const ctrlKey = e.ctrlKey || e.metaKey;
		const range = makeRange(rowIndex, colIndex, rowIndex, colIndex);
		if (e.shiftKey && anchorCellRef.current && areaSelectionConfig.shift) {
			const ranges = selectionRangesRef.current.slice();
			const shiftRange = makeRange(anchorCellRef.current.rowIndex, anchorCellRef.current.colIndex, rowIndex, colIndex);
			if (ranges.length) ranges[ranges.length - 1] = shiftRange;
			else ranges.push(shiftRange);
			selectionRangesRef.current = ranges;
		} else {
			anchorCellRef.current = {
				rowIndex,
				colIndex
			};
			if (ctrlKey && areaSelectionConfig.ctrl) selectionRangesRef.current = selectionRangesRef.current.concat([range]);
			else selectionRangesRef.current = [range];
		}
		isAreaSelectingRef.current = true;
		setIsAreaSelecting(true);
		lastMouseRef.current = {
			x: e.clientX,
			y: e.clientY
		};
		updateSelectionDOM();
		const mm = onDocumentMouseMove;
		const mu = onDocumentMouseUp;
		areaSelDocListenersRef.current = {
			mm,
			mu
		};
		document.addEventListener("mousemove", mm);
		document.addEventListener("mouseup", mu);
	}
	/** 始终指向最新的 onSelectionMouseDown，避免事件回调闭包过期 */
	const onSelectionMouseDownRef = useRef(onSelectionMouseDown);
	onSelectionMouseDownRef.current = onSelectionMouseDown;
	/** 获取列的左边距和宽度
	* @param colIndex 列的绝对索引
	* @returns [left, width]
	*/
	function getColPosition(colIndex) {
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
	function scrollToCell(rowIndex, colIndex) {
		const container = tableContainerRef.current;
		if (!container) return;
		const row = dataSourceCopy[rowIndex];
		const col = tableHeaderLast[colIndex];
		if (!row || !col) return;
		const thead = container.querySelector("thead");
		const headerHeight = thead ? thead.offsetHeight : 0;
		const tfoot = container.querySelector("tfoot");
		const footerHeight = tfoot ? tfoot.offsetHeight : 0;
		const vs = virtualScrollRef.current;
		const vsx = virtualScrollXRef.current;
		const isScrollRowByRow = scrollRowByRow;
		const rh = vs.rowHeight;
		const targetRowTop = rowIndex * rh;
		const targetRowBottom = targetRowTop + rh;
		const visibleTop = isScrollRowByRow ? vs.scrollTop : container.scrollTop;
		const visibleBottom = visibleTop + vs.containerHeight - headerHeight - footerHeight;
		let newScrollTop = null;
		if (targetRowTop < visibleTop) newScrollTop = targetRowTop;
		else if (targetRowBottom > visibleBottom) newScrollTop = targetRowBottom - (vs.containerHeight - headerHeight - footerHeight);
		const [targetColLeft, targetColWidth] = getColPosition(colIndex);
		const targetColRight = targetColLeft + targetColWidth;
		const visibleLeft = container.scrollLeft;
		const visibleRight = visibleLeft + vsx.containerWidth;
		const [leftFixedWidth, rightFixedWidth] = getFixedColWidths(colIndex);
		let newScrollLeft = null;
		if (targetColLeft < visibleLeft + leftFixedWidth) newScrollLeft = targetColLeft - leftFixedWidth;
		else if (targetColRight > visibleRight - rightFixedWidth) newScrollLeft = targetColRight - vsx.containerWidth + rightFixedWidth;
		if (newScrollTop !== null || newScrollLeft !== null) scrollTo(newScrollTop, newScrollLeft);
	}
	function blurCellElement() {
		const container = tableContainerRef.current;
		const activeEl = document.activeElement;
		if (container && activeEl && container.contains(activeEl) && activeEl !== container) container.focus({ preventScroll: true });
	}
	/**
	* 区域选取键盘事件
	* Ctrl+C / Cmd+C 复制；Esc 取消；方向键 / Tab 移动（keyboard=true 时）
	*/
	function onAreaSelectionKeydown(e) {
		if (!areaSelectionConfig.enabled) return;
		const key = e.key;
		if (key === KEY_ESCAPE || key === KEY_ESC) {
			blurCellElement();
			if (selectionRangesRef.current.length) e.preventDefault();
			return;
		}
		if ((e.ctrlKey || e.metaKey) && key === KEY_C && selectionRangesRef.current.length) {
			copySelectedArea();
			e.preventDefault();
			return;
		}
		if (!areaSelectionConfig.keyboard) return;
		const isArrowKey = [
			KEY_ARROW_UP,
			KEY_ARROW_DOWN,
			KEY_ARROW_LEFT,
			KEY_ARROW_RIGHT
		].includes(key);
		const isTabKey = key === KEY_TAB;
		if (!(isArrowKey || isTabKey)) return;
		e.preventDefault();
		const rowCount = dataSourceCopy.length;
		const colCount = tableHeaderLast.length;
		if (rowCount === 0 || colCount === 0) return;
		if (!selectionRangesRef.current.length) {
			anchorCellRef.current = {
				rowIndex: 0,
				colIndex: 0
			};
			selectionRangesRef.current = [makeRange(0, 0, 0, 0)];
			updateSelectionDOM();
			emitSelectionChange();
			scrollToCell(0, 0);
			return;
		}
		const [rowDelta, colDelta] = getMovementDelta(key, e.shiftKey);
		if (e.shiftKey && isArrowKey && areaSelectionConfig.shift) {
			blurCellElement();
			const ranges = [...selectionRangesRef.current];
			const range = ranges.length > 0 ? ranges[ranges.length - 1] : null;
			if (!range) return;
			const { begin, end } = range.index;
			let newEndRow = end.row + rowDelta;
			let newEndCol = end.col + colDelta;
			newEndRow = clampNum(newEndRow, 0, rowCount - 1);
			newEndCol = clampNum(newEndCol, 0, colCount - 1);
			ranges[ranges.length - 1] = makeRange(begin.row, begin.col, newEndRow, newEndCol);
			selectionRangesRef.current = ranges;
			updateSelectionDOM();
			scrollToCell(newEndRow, newEndCol);
		} else {
			blurCellElement();
			const ranges = selectionRangesRef.current;
			const range = ranges.length > 0 ? ranges[ranges.length - 1] : null;
			const baseRow = range ? normalizeRange(range).minRow : 0;
			const baseCol = range ? normalizeRange(range).minCol : 0;
			let newRow = baseRow + rowDelta;
			let newCol = baseCol + colDelta;
			newRow = clampNum(newRow, 0, rowCount - 1);
			newCol = clampNum(newCol, 0, colCount - 1);
			if (isTabKey) {
				const rawCol = baseCol + colDelta;
				const [tabRow, tabCol] = handleTabWrap(baseRow, newCol, rawCol, rowCount, colCount);
				newRow = tabRow;
				newCol = tabCol;
			}
			anchorCellRef.current = {
				rowIndex: newRow,
				colIndex: newCol
			};
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
	function copySelectedArea() {
		const ranges = selectionRangesRef.current;
		if (!ranges.length) return "";
		const range = ranges[ranges.length - 1];
		const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
		const formatCell = areaSelectionConfig.formatCellForClipboard;
		const lines = [];
		for (let r = minRow; r <= maxRow; r++) {
			const row = dataSourceCopy[r];
			if (!row) continue;
			const cells = [];
			for (let c = minCol; c <= maxCol; c++) {
				const col = tableHeaderLast[c];
				if (!col) {
					cells.push("");
					continue;
				}
				const rawValue = row[col.dataIndex];
				cells.push(formatCell ? formatCell(row, col, rawValue) : !rawValue ? "" : String(rawValue));
			}
			lines.push(cells.join("	"));
		}
		const text = lines.join("\n");
		navigator.clipboard.writeText(text).catch(() => {
			console.warn("Failed to copy to clipboard");
		});
		return text;
	}
	/** 获取选中的单元格信息 */
	function getSelectedArea() {
		const ranges = selectionRangesRef.current;
		if (!ranges.length) return {
			rows: [],
			cols: [],
			ranges: []
		};
		const rowSet = /* @__PURE__ */ new Set();
		const colSet = /* @__PURE__ */ new Set();
		for (const range of ranges) {
			const { minRow, maxRow, minCol, maxCol } = normalizeRange(range);
			for (let r = minRow; r <= maxRow; r++) rowSet.add(r);
			for (let c = minCol; c <= maxCol; c++) colSet.add(c);
		}
		const sortedRows = [...rowSet].sort((a, b) => a - b);
		const sortedCols = [...colSet].sort((a, b) => a - b);
		return {
			rows: sortedRows.map((i) => dataSourceCopy[i]).filter(Boolean),
			cols: sortedCols.map((i) => tableHeaderLast[i]).filter(Boolean),
			ranges: ranges.map((r) => ({ ...r }))
		};
	}
	function clearSelectedArea() {
		selectionRangesRef.current = [];
		isAreaSelectingRef.current = false;
		setIsAreaSelecting(false);
		updateSelectionDOM();
	}
	const getRowIndexFn = (row) => {
		const targetKey = rowKeyGen(row);
		return dataSourceCopy.findIndex((item) => rowKeyGen(item) === targetKey);
	};
	const getColumnIndexFn = (column) => {
		const targetKey = colKeyGen(column);
		return tableHeaderLast.findIndex((item) => colKeyGen(item) === targetKey);
	};
	function setAreaSelection(ranges, option = {}) {
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
			beginRow = typeof begin.row === "number" ? begin.row : getRowIndexFn(begin.row);
			endRow = typeof end.row === "number" ? end.row : getRowIndexFn(end.row);
			const beginColInput = typeof begin.col === "number" ? begin.col : begin.col ? getColumnIndexFn(begin.col) : void 0;
			const endColInput = typeof end.col === "number" ? end.col : end.col ? getColumnIndexFn(end.col) : void 0;
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
		anchorCellRef.current = {
			rowIndex: beginRow,
			colIndex: beginCol
		};
		isAreaSelectingRef.current = false;
		setIsAreaSelecting(false);
		updateSelectionDOM();
		if (scrollToView) scrollToCell(endRow, endCol);
		if (!silent) emitSelectionChange();
		return selectionRangesRef.current;
	}
	useEffect(() => {
		updateSelectionDOM();
	}, [
		version,
		dataSourceCopy,
		tableHeaderLast,
		areaSelectionConfig,
		colKeyToIndexMap
	]);
	useEffect(() => {
		return () => {
			const l = areaSelDocListenersRef.current;
			if (l) {
				document.removeEventListener("mousemove", l.mm);
				document.removeEventListener("mouseup", l.mu);
				areaSelDocListenersRef.current = null;
			}
			if (autoScrollRafIdRef.current) {
				cancelAnimationFrame(autoScrollRafIdRef.current);
				autoScrollRafIdRef.current = 0;
			}
		};
	}, []);
	useEffect(() => {
		if (!areaSelectionConfig.enabled) return;
		const rowCount = dataSourceCopy.length;
		const colCount = tableHeaderLast.length;
		const anchor = anchorCellRef.current;
		if (anchor) if (rowCount === 0 || colCount === 0) anchorCellRef.current = null;
		else {
			anchor.rowIndex = clampNum(anchor.rowIndex, 0, rowCount - 1);
			anchor.colIndex = clampNum(anchor.colIndex, 0, colCount - 1);
		}
		const ranges = selectionRangesRef.current;
		if (!ranges.length) return;
		if (rowCount === 0 || colCount === 0) {
			clearSelectedArea();
			emitSelectionChange();
			return;
		}
		const maxRow = rowCount - 1;
		const maxCol = colCount - 1;
		let changed = false;
		const newRanges = [];
		for (const range of ranges) {
			const { begin, end } = range.index;
			const nbRow = clampNum(begin.row, 0, maxRow);
			const nbCol = clampNum(begin.col, 0, maxCol);
			const neRow = clampNum(end.row, 0, maxRow);
			const neCol = clampNum(end.col, 0, maxCol);
			if (nbRow !== begin.row || nbCol !== begin.col || neRow !== end.row || neCol !== end.col) {
				changed = true;
				newRanges.push(makeRange(nbRow, nbCol, neRow, neCol));
			} else newRanges.push(range);
		}
		if (changed) {
			selectionRangesRef.current = newRanges;
			emitSelectionChange();
		}
	}, [dataSourceCopy.length, tableHeaderLast.length]);
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
				updateFixedShadow();
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
			updateCustomScrollbar();
		});
	}, [
		isExperimentalScrollY,
		virtualX_on,
		updateVirtualScrollY,
		updateVirtualScrollX,
		updateFixedShadow,
		onScroll,
		onScrollX,
		updateCustomScrollbar
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
				updateCustomScrollbar();
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
		updateVirtualScrollY,
		updateCustomScrollbar
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
		const defaultSort = sc.defaultSort;
		if (existingIndex >= 0) {
			const currentOrder = sortStates[existingIndex].order;
			if (currentOrder && defaultSort && (defaultSort.key === colKeyVal || defaultSort.dataIndex === col.dataIndex)) {
				const defaultSwitchOrder = SORT_SWITCH_ORDER.filter((order) => order !== null);
				newOrder = defaultSwitchOrder[(defaultSwitchOrder.indexOf(currentOrder) + 1) % defaultSwitchOrder.length];
			} else newOrder = SORT_SWITCH_ORDER[(SORT_SWITCH_ORDER.indexOf(currentOrder) + 1) % 3];
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
		} else {
			newStates = sortStates.filter((s) => s.key !== colKeyVal && s.dataIndex !== colKeyVal);
			if (defaultSort === null || defaultSort === void 0 ? void 0 : defaultSort.order) {
				const defaultSortCol = tableHeaderLast.find((c) => defaultSort.key && colKeyGen(c) === defaultSort.key || c.dataIndex === defaultSort.dataIndex);
				const defaultState = {
					key: defaultSort.key ?? (defaultSortCol === null || defaultSortCol === void 0 ? void 0 : defaultSortCol.key),
					dataIndex: defaultSort.dataIndex,
					sortField: defaultSort.sortField ?? (defaultSortCol === null || defaultSortCol === void 0 ? void 0 : defaultSortCol.sortField),
					sortType: defaultSort.sortType ?? (defaultSortCol === null || defaultSortCol === void 0 ? void 0 : defaultSortCol.sortType),
					order: defaultSort.order
				};
				const defaultKey = defaultState.key || defaultState.dataIndex;
				const filtered = newStates.filter((s) => s.key !== defaultKey && s.dataIndex !== defaultKey);
				newStates = sc.multiSort ? [defaultState, ...filtered].slice(0, sc.multiSortLimit ?? 3) : [defaultState];
			}
		}
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
	/** 当前 hover 高亮的合并单元格 cellKey 集合（不触发重渲染，直接操作 dom class） */
	const hoverMergedCellsRef = useRef(EMPTY_CELL_KEY_SET);
	/**
	* 更新 rowspan 合并单元格的 hover 高亮（对齐 stk-table-vue）
	* hover 到被 rowspan 覆盖的行时，同步高亮对应的合并起始单元格
	*/
	const updateHoverMergedCells = useCallback((rowKey) => {
		const { hoverRowMap, mergeCellPosMap } = mergeCellsInfo;
		const nextSet = rowKey != null && hoverRowMap.get(String(rowKey)) || EMPTY_CELL_KEY_SET;
		const prevSet = hoverMergedCellsRef.current;
		if (prevSet === nextSet) return;
		const findMergeTd = (cellKey) => {
			const pos = mergeCellPosMap.get(cellKey);
			if (!pos) return null;
			const tr = trRefsMap.current.get(String(pos.rowKey));
			return (tr === null || tr === void 0 ? void 0 : tr.querySelector(`td[data-col-key="${pos.colKey}"]`)) || null;
		};
		for (const cellKey of prevSet) {
			var _findMergeTd;
			if (nextSet.has(cellKey)) continue;
			(_findMergeTd = findMergeTd(cellKey)) === null || _findMergeTd === void 0 || _findMergeTd.classList.remove("cell-hover");
		}
		for (const cellKey of nextSet) {
			var _findMergeTd2;
			if (prevSet.has(cellKey)) continue;
			(_findMergeTd2 = findMergeTd(cellKey)) === null || _findMergeTd2 === void 0 || _findMergeTd2.classList.add("cell-hover");
		}
		hoverMergedCellsRef.current = nextSet;
	}, [mergeCellsInfo]);
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
			if (rowHover) updateHoverMergedCells(null);
		}
	}, [
		dataSourceCopy,
		tableHeaderLast,
		colKeyGen,
		showTrHoverClass,
		rowHover,
		updateHoverMergedCells,
		onCellMouseleave
	]);
	const handleCellMouseDown = useCallback((e) => {
		const rowIndex = getClosestTrIndex(e.target) || 0;
		const row = dataSourceCopy[rowIndex];
		const colKeyVal = getClosestColKey(e.target);
		const col = tableHeaderLast.find((item) => colKeyGen(item) === colKeyVal);
		onCellMousedown === null || onCellMousedown === void 0 || onCellMousedown(e, row, col, { rowIndex });
		onSelectionMouseDownRef.current(e.nativeEvent);
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
		const rowKey = tr.dataset.rowKey || null;
		if (showTrHoverClass) setCurrentHoverRowKey(rowKey);
		if (rowHover) updateHoverMergedCells(rowKey);
	}, [
		dataSourceCopy,
		showTrHoverClass,
		rowHover,
		updateHoverMergedCells
	]);
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
	const [setHighlightDimRow, setHighlightDimCell] = useHighlight(highlightConfig, theme, stkTableId, tableContainerRef);
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
		let newStates = [];
		if (order) {
			const column = getTableHeaderLast().find((it) => colKeyGen(it) === colKeyVal);
			if (column) newStates = [{
				key: colKeyVal,
				dataIndex: column.dataIndex,
				sortField: column.sortField,
				sortType: column.sortType,
				order
			}];
		}
		setSortStates(newStates);
		if (sort && dataSource.length) {
			if (!sortRemote || option.force) {
				let data = sortData(dataSource.slice(), newStates);
				if (isTreeData) data = flatTreeData(data);
				data = filterDataSource(data);
				setDataSourceCopy(data);
			}
		}
		return dataSourceCopy;
	}, [
		getTableHeaderLast,
		colKeyGen,
		dataSource,
		sortRemote,
		sortData,
		isTreeData,
		flatTreeData,
		filterDataSource,
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
		updateVirtualScrollY(virtualScrollRef.current.scrollTop);
		updateCustomScrollbar();
	}, [
		dataSourceCopy,
		updateVirtualScrollY,
		updateCustomScrollbar
	]);
	useEffect(() => {
		dealColumns(columns);
		setVersion((v) => v + 1);
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
			setVersion((v) => v + 1);
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
	useEffect(() => {
		if (!onlyDragScroll) return;
		const container = tableContainerRef.current;
		if (!container) return;
		const handleMouseDown = (e) => {
			if (e.target.classList.contains("stk-table")) {
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
		container.addEventListener("mousedown", handleMouseDown);
		container.addEventListener("mouseup", handleMouseUp);
		return () => {
			container.removeEventListener("mousedown", handleMouseDown);
			container.removeEventListener("mouseup", handleMouseUp);
			if (srbrDebounceRef.current) window.clearTimeout(srbrDebounceRef.current);
		};
	}, [onlyDragScroll]);
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
		getSelectedArea,
		setAreaSelection,
		clearSelectedArea,
		copySelectedArea,
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
		setFilter,
		areaSelectionConfig,
		onAreaSelectionChange
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
		if (isSRBRActive) classes.push("scroll-row-by-row");
		if (scrollbarOptions.enabled) classes.push("scrollbar-on");
		if (areaSelectionConfig.enabled) classes.push("area-selection");
		if (isAreaSelecting) classes.push("is-area-selecting");
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
		isSRBRActive,
		scrollbarOptions,
		areaSelectionConfig,
		isAreaSelecting,
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
			tabIndex: areaSelectionConfig.enabled ? 0 : void 0,
			onScroll: onTableScroll,
			onWheel: onTableWheel,
			onKeyDown: onAreaSelectionKeydown,
			children: [
				!isExperimentalScrollY && SRBRTotalHeight > 0 && /* @__PURE__ */ jsx("div", {
					className: "row-by-row-table-height",
					style: { height: SRBRTotalHeight }
				}),
				colResizable && /* @__PURE__ */ jsx("div", {
					ref: colResizeIndicatorRef,
					className: "column-resize-indicator"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "stk-table-scroll-container",
					children: [/* @__PURE__ */ jsxs("table", {
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
							!headless && /* @__PURE__ */ jsx("thead", { children: virtualX_tableHeaders.map((row, rowIndex) => /* @__PURE__ */ jsxs("tr", {
								onContextMenu: (e) => onHeaderRowMenu === null || onHeaderRowMenu === void 0 ? void 0 : onHeaderRowMenu(e),
								children: [
									virtualX_on && /* @__PURE__ */ jsx("th", {
										className: "vt-x-left",
										style: {
											minWidth: theadVirtualX.offsetLeft,
											width: theadVirtualX.offsetLeft
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
									!isExperimentalScrollY && virtual_on && !isSRBRActive && /* @__PURE__ */ jsx("tr", {
										style: { height: virtualScrollRef.current.offsetTop },
										className: "padding-top-tr",
										children: fixedMode && headless && /* @__PURE__ */ jsxs(Fragment, { children: [
											virtualX_on && /* @__PURE__ */ jsx("td", {
												className: "vt-x-left",
												style: {
													minWidth: theadVirtualX.offsetLeft,
													width: theadVirtualX.offsetLeft
												}
											}),
											virtualX_columnPart.map((col, idx) => {
												if (col.__VT_C_SP__) return /* @__PURE__ */ jsx("td", {
													className: "vt-x-spacer",
													colSpan: col.__VT_C_SP__
												}, `spacer-${idx}`);
												return /* @__PURE__ */ jsx("td", { style: cellStyleMap[TagType.TD].get(colKeyGen(col)) }, idx);
											}),
											virtualX_on && /* @__PURE__ */ jsx("td", {
												className: "vt-x-right",
												style: {
													minWidth: virtualX_offsetRight,
													width: virtualX_offsetRight
												}
											})
										] })
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
											ref: (el) => {
												if (el) trRefsMap.current.set(String(rk), el);
												else trRefsMap.current.delete(String(rk));
											},
											id: stkTableId + "-" + rk,
											"data-row-key": rk,
											"data-row-i": absRowIndex,
											className: trClasses,
											children: [
												virtualX_on && /* @__PURE__ */ jsx("td", { className: "vt-x-left" }),
												virtualX_columnPart.map((col, _colIdx) => {
													var _mergeCellsInfo$hidde;
													if (col.__VT_C_SP__) return /* @__PURE__ */ jsx("td", {
														className: "vt-x-spacer",
														colSpan: col.__VT_C_SP__
													}, `spacer-${_colIdx}`);
													const ck = colKeyGen(col);
													if ((_mergeCellsInfo$hidde = mergeCellsInfo.hiddenCellMap.get(rk)) === null || _mergeCellsInfo$hidde === void 0 ? void 0 : _mergeCellsInfo$hidde.has(ck)) return null;
													const mergeSpan = mergeCellsInfo.mergeSpanMap.get(pureCellKeyGen(rk, ck));
													const cellKey = cellKeyGen(row, col);
													const tdClasses = [
														col.className || "",
														...fixedColClassMap.get(ck) || [],
														col.align === "center" ? "text-c" : col.align === "right" ? "text-r" : "",
														cellActive && currentSelectedCellKey === cellKey ? "active" : "",
														col.type === "seq" ? "seq-column" : "",
														col.type === "expand" && row.__EXP__ && colKeyGen(row.__EXP__) === ck ? "expanded" : "",
														row.__T_EXP__ && col.type === "tree-node" ? "tree-expanded" : "",
														col.type === "dragRow" ? "drag-row-cell" : "",
														col.mergeCells && hoverMergedCellsRef.current.has(cellKey) ? "cell-hover" : "",
														col.mergeCells && activeMergedCells.has(cellKey) ? "cell-active" : ""
													].filter(Boolean).join(" ");
													return /* @__PURE__ */ jsx("td", {
														"data-col-key": ck,
														style: cellStyleMap[TagType.TD].get(ck),
														className: tdClasses,
														colSpan: mergeSpan === null || mergeSpan === void 0 ? void 0 : mergeSpan.colspan,
														rowSpan: mergeSpan === null || mergeSpan === void 0 ? void 0 : mergeSpan.rowspan,
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
									!isExperimentalScrollY && /* @__PURE__ */ jsxs(Fragment, { children: [virtual_on && !isSRBRActive && /* @__PURE__ */ jsx("tr", { style: { height: virtual_offsetBottom } }), SRBRBottomHeight > 0 && /* @__PURE__ */ jsx("tr", { style: { height: SRBRBottomHeight } })] })
								]
							})
						]
					}), scrollbarOptions.enabled && showScrollbar.y && /* @__PURE__ */ jsx("div", {
						className: "stk-sb-thumb vertical",
						style: {
							height: sbThumb.h,
							transform: `translateY(${sbThumb.t}px)`
						},
						onMouseDown: onVerticalScrollbarMouseDown,
						onTouchStart: onVerticalScrollbarMouseDown
					})]
				}),
				(!dataSourceCopy || !dataSourceCopy.length) && showNoData && /* @__PURE__ */ jsx("div", {
					className: `stk-table-no-data${noDataFull ? " no-data-full" : ""}`,
					children: renderEmpty ? renderEmpty() : "暂无数据"
				}),
				renderCustomBottom === null || renderCustomBottom === void 0 ? void 0 : renderCustomBottom(),
				scrollbarOptions.enabled && showScrollbar.x && /* @__PURE__ */ jsx("div", {
					className: "stk-sb-thumb horizontal",
					style: {
						width: sbThumb.w,
						transform: `translateX(${sbThumb.l}px)`
					},
					onMouseDown: onHorizontalScrollbarMouseDown,
					onTouchStart: onHorizontalScrollbarMouseDown
				})
			]
		})
	});
	function renderFooter() {
		return footerData.map((footRow, footRowIndex) => /* @__PURE__ */ jsxs("tr", { children: [
			virtualX_on && /* @__PURE__ */ jsx("td", {
				className: "vt-x-left",
				style: {
					minWidth: theadVirtualX.offsetLeft,
					width: theadVirtualX.offsetLeft
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
