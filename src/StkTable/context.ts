import { createContext } from 'react';
import type { UniqKey } from './types';

/**
 * StkTable 内部上下文
 *
 * 用于让 customCell / customHeaderCell（如 createCheckboxCell / createFilterCell 创建的单元格）
 * 能够访问到所在表格的数据源、主题与筛选方法。
 */
export type StkTableContextType<DT extends Record<string, any> = any> = {
    /** 当前表格数据（已排序/筛选后的数据） */
    dataSource: DT[];
    /** 主题 */
    theme: 'light' | 'dark';
    /** 设置筛选状态 */
    setFilter: (status: Record<UniqKey, any> | null, option?: { remote?: boolean; silent?: boolean }) => void;
};

export const StkTableContext = createContext<StkTableContextType | null>(null);
