import { useCallback, useRef } from 'react';
import { HIGHLIGHT_CELL_CLASS, HIGHLIGHT_COLOR, HIGHLIGHT_DURATION, HIGHLIGHT_ROW_CLASS } from '../const';
import type { HighlightConfig, UniqKey } from '../types';

/** 存放高亮行信息 */
type HighlightDimRowStore = {
    /** 动画开始时间戳 */
    readonly ts: number;
    /** 行是否可见 */
    visible: boolean;
    /** 动画关键帧 */
    keyframe: Keyframe[] | PropertyIndexedKeyframes;
    /** 动画初始持续时间 */
    readonly duration: number;
    /** 忽略不可见元素：获取不到dom时直接丢弃，不再循环计算 */
    ignoreInvisible?: boolean;
};

/**
 * 高亮单元格，行
 * 移植自 stk-table-vue useHighlight.ts
 */
export function useHighlight(
    highlightConfig: HighlightConfig,
    theme: string,
    stkTableId: string,
    tableContainerRef: React.RefObject<HTMLDivElement | null>,
) {
    /**
     * 存放高亮行的状态-使用animation api实现
     * @key 行唯一键
     * @value 记录高亮配置
     */
    const highlightDimRowsAnimationRef = useRef(new Map<UniqKey, HighlightDimRowStore>());
    /** 是否正在计算高亮行的循环 */
    const calcLoopRunningRef = useRef(false);
    /** 高亮后渐暗的行定时器 */
    const highlightDimRowsTimeoutRef = useRef(new Map<UniqKey, number>());
    /** 高亮后渐暗的单元格定时器 */
    const highlightDimCellsTimeoutRef = useRef(new Map<string, number>());

    const getHighlightFrom = useCallback(
        () => HIGHLIGHT_COLOR[(theme as 'light' | 'dark') === 'dark' ? 'dark' : 'light'].from,
        [theme],
    );

    const getDefaultOption = useCallback(() => {
        const duration = highlightConfig.duration ? highlightConfig.duration * 1000 : HIGHLIGHT_DURATION;
        const frequency = highlightConfig.fps && highlightConfig.fps > 0 ? 1000 / highlightConfig.fps : null;
        const steps = frequency ? Math.round(duration / frequency) : null;
        const keyframe: PropertyIndexedKeyframes = { backgroundColor: [getHighlightFrom(), ''] };
        if (steps) {
            keyframe.easing = `steps(${steps})`;
        }
        return { duration, keyframe };
    }, [highlightConfig, getHighlightFrom]);

    /**
     * 更新行状态
     * @returns 是否应该从store中删除（ignoreInvisible为true且DOM不存在时返回true）
     */
    const updateRowAnimation = useCallback(
        (rowKeyValue: UniqKey, store: HighlightDimRowStore, timeOffset: number): boolean => {
            const rowEl = document.getElementById(stkTableId + '-' + String(rowKeyValue));
            const { visible, ignoreInvisible } = store;
            if (!rowEl) {
                if (ignoreInvisible) return true;
                if (visible) store.visible = false;
                return false;
            }
            const { keyframe, duration: initialDuration } = store;
            // 只有元素 不可见 -> 可见 时才需要更新
            if (!visible) {
                store.visible = true;
                /** 经过的时间 ÷ 高亮持续时间 计算出 颜色过渡进度 (0-1) */
                const iterationStart = timeOffset / initialDuration;
                rowEl.animate(keyframe, {
                    duration: initialDuration - timeOffset,
                    iterationStart,
                    iterations: 1 - iterationStart,
                });
            }
            return false;
        },
        [stkTableId],
    );

    /** 计算高亮渐暗颜色的循环 */
    const calcRowHighlightLoop = useCallback(() => {
        if (calcLoopRunningRef.current) return;
        calcLoopRunningRef.current = true;
        const store = highlightDimRowsAnimationRef.current;
        const recursion = () => {
            window.requestAnimationFrame(() => {
                const nowTs = performance.now();
                const keysToDelete: UniqKey[] = [];
                store.forEach((s, rowKeyValue) => {
                    const timeOffset = nowTs - s.ts;
                    if (timeOffset < s.duration) {
                        const shouldDelete = updateRowAnimation(rowKeyValue, s, timeOffset);
                        if (shouldDelete) keysToDelete.push(rowKeyValue);
                    } else {
                        keysToDelete.push(rowKeyValue);
                    }
                });
                keysToDelete.forEach(key => store.delete(key));
                if (store.size) {
                    recursion();
                } else {
                    calcLoopRunningRef.current = false;
                    store.clear();
                }
            });
        };
        recursion();
    }, [updateRowAnimation]);

    /** 使用css @keyframes动画，实现高亮行动画 */
    const highlightRowsInCssKeyframe = useCallback(
        (rowKeyValues: UniqKey[], className: string, duration: number) => {
            let needRepaint = false;
            const rowElTemp: HTMLTableRowElement[] = [];
            for (let i = 0; i < rowKeyValues.length; i++) {
                const rowKeyValue = rowKeyValues[i];
                const rowEl = document.getElementById(stkTableId + '-' + String(rowKeyValue)) as HTMLTableRowElement | null;
                if (!rowEl) continue;
                if (rowEl.classList.contains(className)) {
                    rowEl.classList.remove(className);
                    needRepaint = true;
                }
                rowElTemp.push(rowEl);
                window.clearTimeout(highlightDimRowsTimeoutRef.current.get(rowKeyValue));
                highlightDimRowsTimeoutRef.current.set(
                    rowKeyValue,
                    window.setTimeout(() => {
                        rowEl.classList.remove(className);
                        highlightDimRowsTimeoutRef.current.delete(rowKeyValue);
                    }, duration),
                );
            }
            if (needRepaint) {
                void tableContainerRef.current?.offsetWidth;
            }
            rowElTemp.forEach(el => el.classList.add(className));
        },
        [stkTableId, tableContainerRef],
    );

    /** 使用css @keyframes动画，实现高亮单元格动画 */
    const highlightCellsInCssKeyFrame = useCallback(
        (cellEl: HTMLElement, rowKeyValue: UniqKey, colKeyValue: string, className: string, duration: number) => {
            if (cellEl.classList.contains(className)) {
                cellEl.classList.remove(className);
                void cellEl.offsetHeight;
            }
            cellEl.classList.add(className);
            const cellKey = `${rowKeyValue}-${colKeyValue}`;
            window.clearTimeout(highlightDimCellsTimeoutRef.current.get(cellKey));
            if (!duration) return;
            highlightDimCellsTimeoutRef.current.set(
                cellKey,
                window.setTimeout(() => {
                    cellEl.classList.remove(className);
                    highlightDimCellsTimeoutRef.current.delete(cellKey);
                }, duration),
            );
        },
        [],
    );

    /**
     * 高亮一行
     * @param option.method css-使用css渲染，animation-使用animation api。默认animation
     * @param option.keyframe 自定义keyframe
     * @param option.duration 动画时长
     */
    const setHighlightDimRow = useCallback(
        (rowKeyValues: UniqKey[], option: any = {}) => {
            if (!Array.isArray(rowKeyValues)) rowKeyValues = [rowKeyValues];
            if (!rowKeyValues.length) return;
            const { className, method, keyframe, duration } = {
                className: HIGHLIGHT_ROW_CLASS,
                method: 'animation',
                ...getDefaultOption(),
                ...option,
            };
            const ignoreInvisible = Boolean(option.ignoreInvisible);
            if (method === 'animation') {
                // 使用 store + rAF 循环，行尚未渲染（如新增数据后）时可重试直到出现
                const nowTs = performance.now();
                for (let i = 0; i < rowKeyValues.length; i++) {
                    const rowKeyValue = rowKeyValues[i];
                    const store: HighlightDimRowStore = { ts: nowTs, visible: false, keyframe, duration, ignoreInvisible };
                    const shouldDelete = updateRowAnimation(rowKeyValue, store, 0);
                    if (ignoreInvisible && shouldDelete) {
                        highlightDimRowsAnimationRef.current.delete(rowKeyValue);
                    } else {
                        highlightDimRowsAnimationRef.current.set(rowKeyValue, store);
                    }
                }
                calcRowHighlightLoop();
            } else {
                highlightRowsInCssKeyframe(rowKeyValues, className, duration);
            }
        },
        [getDefaultOption, updateRowAnimation, calcRowHighlightLoop, highlightRowsInCssKeyframe],
    );

    /**
     * 高亮一个单元格
     * @param option.keyframe 自定义keyframe
     * @param option.duration 动画时长
     */
    const setHighlightDimCell = useCallback(
        (rowKeyValue: UniqKey, colKeyValue: string, option: any = {}) => {
            const cellEl = tableContainerRef.current?.querySelector<HTMLElement>(
                `[data-row-key="${rowKeyValue}"] [data-col-key="${colKeyValue}"]`,
            );
            if (!cellEl) return;
            const { className, method, duration, keyframe } = {
                className: HIGHLIGHT_CELL_CLASS,
                method: 'animation',
                ...getDefaultOption(),
                ...option,
            };
            if (method === 'animation') {
                cellEl.animate(keyframe, duration);
            } else {
                highlightCellsInCssKeyFrame(cellEl, rowKeyValue, colKeyValue, className, duration);
            }
        },
        [getDefaultOption, highlightCellsInCssKeyFrame, tableContainerRef],
    );

    return [setHighlightDimRow, setHighlightDimCell] as const;
}
