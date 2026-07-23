import { PrivateRowDT, PrivateStkTableColumn, StkTableColumn } from '../types';

/**
 * Table Columns Processing Hook (React)
 * Handles multi-level header processing and column flattening
 */
export declare function useTableColumns<DT extends Record<string, any>>(isRelativeMode: boolean): {
    tableHeadersRef: import('react').RefObject<PrivateStkTableColumn<PrivateRowDT>[][]>;
    tableHeadersForCalcRef: import('react').RefObject<PrivateStkTableColumn<PrivateRowDT>[][]>;
    dealColumns: (columns: StkTableColumn<DT>[]) => void;
};
