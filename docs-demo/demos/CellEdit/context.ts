import { createContext } from 'react';

/**
 * CellEdit demo 内部使用的刷新上下文。
 * 由于 React 中直接修改 row 对象不会触发表格重渲染，
 * 单元格编辑完成后通过该回调通知外层更新 dataSource 以刷新视图。
 */
export const CellEditRefreshContext = createContext<() => void>(() => {});
