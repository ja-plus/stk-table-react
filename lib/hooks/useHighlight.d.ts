import { HighlightConfig, UniqKey } from '../types';

/**
 * 高亮单元格，行
 * 移植自 stk-table-vue useHighlight.ts
 */
export declare function useHighlight(highlightConfig: HighlightConfig, theme: string, stkTableId: string, tableContainerRef: React.RefObject<HTMLDivElement | null>): readonly [(rowKeyValues: UniqKey[], option?: any) => void, (rowKeyValue: UniqKey, colKeyValue: string, option?: any) => void];
