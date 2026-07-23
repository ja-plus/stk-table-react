import { CELL_KEY_SEPARATE, DEFAULT_SORT_CONFIG } from '../const';
import { Order, SortConfig, SortOption, SortState, StkTableColumn, UniqKey } from '../types';

/** 是否空值 */
export function isEmptyValue(val: any, isNumber?: boolean) {
    let isEmpty = val === null || val === void 0;
    if (isNumber) {
        isEmpty = isEmpty || typeof val === 'boolean' || Number.isNaN(+val);
    }
    return isEmpty;
}

/**
 * 对有序数组插入新数据
 */
export function insertToOrderedArray<T extends object>(
    sortState: SortState<T>,
    newItem: T,
    targetArray: T[],
    sortConfig: SortConfig<T> & { customCompare?: (a: T, b: T) => number } = {},
) {
    let { dataIndex, sortField, order } = sortState;
    let { sortType } = sortState;

    // 当 order 为空时，尝试回退到 defaultSort
    if (!order && sortConfig.defaultSort) {
        order = sortConfig.defaultSort.order;
        dataIndex = sortConfig.defaultSort.dataIndex as any;
    }

    const field = sortField || dataIndex;
    if (!sortType) sortType = typeof newItem[field] as 'number' | 'string';
    const isNumber = sortType === 'number';
    const data = targetArray.slice();

    if (!order || !data.length) {
        data.unshift(newItem);
        return data;
    }

    const { emptyToBottom, customCompare, stringLocaleCompare } = { emptyToBottom: false, ...sortConfig };

    const targetVal: any = newItem[field];
    if (emptyToBottom && isEmptyValue(targetVal, isNumber)) {
        data.push(newItem);
    } else {
        const isAsc = order === 'asc';
        const customCompareFn =
            customCompare ||
            ((a, b) => {
                const midVal: any = a[field];
                const compareRes = strCompare(midVal, targetVal, isNumber, stringLocaleCompare);
                return isAsc ? compareRes : -compareRes;
            });
        const sIndex = binarySearch(data, midIndex => customCompareFn(data[midIndex], newItem));
        data.splice(sIndex, 0, newItem);
    }

    return data;
}

/**
 * 二分查找
 */
export function binarySearch(searchArray: any[], compareCallback: (midIndex: number) => number) {
    let sIndex = 0;
    let eIndex = searchArray.length - 1;
    while (sIndex <= eIndex) {
        const midIndex = Math.floor((sIndex + eIndex) / 2);
        const compareRes = compareCallback(midIndex);
        if (compareRes === 0) {
            sIndex = midIndex;
            break;
        } else if (compareRes < 0) {
            sIndex = midIndex + 1;
        } else {
            eIndex = midIndex - 1;
        }
    }
    return sIndex;
}

/**
 * 字符串比较
 */
export function strCompare(a: string, b: string, isNumber: boolean, localeCompare = false): number {
    let _a: number | string = a;
    let _b: number | string = b;
    if (isNumber) {
        _a = +a;
        _b = +b;
    } else if (localeCompare) {
        return String(a).localeCompare(b);
    }
    if (_a > _b) return 1;
    else if (_a === _b) return 0;
    else return -1;
}

/**
 * 分离出空数据和非空数据成两个数组
 */
function separatedData<T extends Record<string, any>>(sortOption: SortOption<T>, targetDataSource: T[], isNumber?: boolean) {
    const emptyArr: T[] = [];
    const valueArr: T[] = [];
    const sortField = sortOption.sortField || sortOption.dataIndex;

    for (let i = 0, len = targetDataSource.length; i < len; i++) {
        const row = targetDataSource[i];
        const isEmpty = isEmptyValue(row?.[sortField], isNumber);
        if (isEmpty) {
            emptyArr.push(row);
        } else {
            valueArr.push(row);
        }
    }
    return [valueArr, emptyArr] as const;
}

/**
 * 表格排序
 */
export function tableSort<T extends Record<string, any>>(
    sortOption: SortOption<T>,
    order: Order,
    dataSource: T[],
    sortConfig: SortConfig<T> = {},
): T[] {
    if (!dataSource?.length || !sortOption) return dataSource || [];

    sortConfig = { ...DEFAULT_SORT_CONFIG, ...sortConfig };
    let targetDataSource = dataSource.slice();
    let sortField = sortOption.sortField || sortOption.dataIndex;
    const { defaultSort, stringLocaleCompare, emptyToBottom, sortChildren } = sortConfig;

    if (!order && defaultSort) {
        order = defaultSort.order;
        sortField = defaultSort.dataIndex;
    }

    if (typeof sortOption.sorter === 'function') {
        const customSorterData = sortOption.sorter(targetDataSource, { order, column: sortOption });
        if (customSorterData) targetDataSource = customSorterData;

        if (sortChildren) {
            targetDataSource.forEach(item => {
                if (!item.children?.length) return;
                (item as any).children = tableSort(sortOption, order, item.children, sortConfig);
            });
        }
    } else if (order) {
        let { sortType } = sortOption;
        if (!sortType) sortType = typeof dataSource[0][sortField] as 'number' | 'string';

        const isNumber = sortType === 'number';
        const [valueArr, emptyArr] = separatedData(sortOption, targetDataSource, isNumber);

        if (order === 'asc') {
            valueArr.sort((a, b) => strCompare(a[sortField], b[sortField], isNumber, stringLocaleCompare));
        } else {
            valueArr.sort((a, b) => strCompare(b[sortField], a[sortField], isNumber, stringLocaleCompare));
        }

        targetDataSource = order === 'desc' || emptyToBottom ? valueArr.concat(emptyArr) : emptyArr.concat(valueArr);

        if (sortChildren) {
            targetDataSource.forEach(item => {
                if (!item.children?.length) return;
                (item as any).children = tableSort(sortOption, order, item.children, sortConfig);
            });
        }
    }
    return targetDataSource;
}

/** 多级表头深度 */
export function howDeepTheHeader(arr: StkTableColumn<any>[], level = 0) {
    const levels = [level];
    arr.forEach(item => {
        if (item.children?.length) {
            levels.push(howDeepTheHeader(item.children, level + 1));
        }
    });
    return Math.max(...levels);
}

/** number width +px */
export function transformWidthToStr(width?: string | number) {
    if (width === void 0) return;
    const numberWidth = Number(width);
    return width + (!Number.isNaN(numberWidth) ? 'px' : '');
}

export function getBrowsersVersion(browserName: string) {
    try {
        const reg = new RegExp(`${browserName}/\\d+`, 'i');
        const userAgent = navigator.userAgent.match(reg);
        if (userAgent) {
            return +userAgent[0].split('/')[1];
        }
    } catch (e) {
        // ignore
    }
    return 100;
}

export function pureCellKeyGen(rowKey: UniqKey, colKey: UniqKey) {
    return rowKey + CELL_KEY_SEPARATE + colKey;
}

export function getClosestTr(target: HTMLElement) {
    return target?.closest('tr');
}

export function getClosestTh(target: HTMLElement) {
    return target?.closest('th');
}

export function getClosestTd(target: HTMLElement) {
    return target?.closest('td');
}

export function getClosestTrIndex(target: HTMLElement) {
    const tr = getClosestTr(target);
    if (!tr) return -1;
    return Number((tr as HTMLElement).dataset.rowI);
}

export function getClosestColKey(target: HTMLElement) {
    return (getClosestTd(target as HTMLElement) as HTMLElement)?.dataset.colKey;
}

/**
 * 改进的节流函数
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: number;
    let lastArgs: Parameters<T> | null = null;

    const callFn = () => {
        if (lastArgs) {
            fn(...lastArgs);
            lastArgs = null;
        }
    };

    return function (...args: Parameters<T>) {
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

/**
 * requestAnimationFrame-based throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void {
    let rafId: number | null = null;
    let lastArgs: Parameters<T> | null = null;

    const callFn = () => {
        if (lastArgs) {
            fn(...lastArgs);
            lastArgs = null;
        }
    };

    return function (...args: Parameters<T>) {
        lastArgs = args;
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                callFn();
                rafId = null;
            });
        }
    };
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (...args: Parameters<T>) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    };
}
