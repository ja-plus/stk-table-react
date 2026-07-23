import { useRef, useCallback } from 'react';
import { PrivateRowDT, PrivateStkTableColumn, StkTableColumn } from '../types';
import { getColWidth } from '../utils/constRefUtils';
import { howDeepTheHeader } from '../utils';

/**
 * Table Columns Processing Hook (React)
 * Handles multi-level header processing and column flattening
 */
export function useTableColumns<DT extends Record<string, any>>(isRelativeMode: boolean) {
    const tableHeadersRef = useRef<PrivateStkTableColumn<PrivateRowDT>[][]>([]);
    const tableHeadersForCalcRef = useRef<PrivateStkTableColumn<PrivateRowDT>[][]>([]);

    const dealColumns = useCallback(
        (columns: StkTableColumn<DT>[]) => {
            const tableHeadersTemp: PrivateStkTableColumn<PrivateRowDT>[][] = [];
            const tableHeadersForCalcTemp: PrivateStkTableColumn<PrivateRowDT>[][] = [];
            let copyColumn: StkTableColumn<DT>[] = columns;

            if (isRelativeMode) {
                const leftCol: StkTableColumn<DT>[] = [];
                const centerCol: StkTableColumn<DT>[] = [];
                const rightCol: StkTableColumn<DT>[] = [];

                for (let i = 0, len = copyColumn.length; i < len; i++) {
                    const col = copyColumn[i];
                    if (col.fixed === 'left') {
                        leftCol.push(col);
                    } else if (col.fixed === 'right') {
                        rightCol.push(col);
                    } else {
                        centerCol.push(col);
                    }
                }
                copyColumn = leftCol.concat(centerCol).concat(rightCol);
            }

            const maxDeep = howDeepTheHeader(copyColumn);

            for (let i = 0; i <= maxDeep; i++) {
                tableHeadersTemp[i] = [];
                tableHeadersForCalcTemp[i] = [];
            }

            let leafIndex = 0;

            function flat(
                arr: PrivateStkTableColumn<PrivateRowDT>[],
                parent: PrivateStkTableColumn<PrivateRowDT> | null,
                depth = 0,
            ): [number, number] {
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
                        for (let j = depth; j <= maxDeep; j++) {
                            tableHeadersForCalcTemp[j].push(col);
                        }
                    }

                    col.__LF_E__ = leafIndex;
                    col.__W__ = colWidth;
                    tableHeadersTemp[depth].push(col);
                    const rowSpan = col.children ? 1 : maxDeep - depth + 1;
                    const colSpan = colChildrenLen;

                    if (rowSpan > 1) {
                        col.__R_SP__ = rowSpan;
                    }
                    if (colSpan > 1) {
                        col.__C_SP__ = colSpan;
                    }

                    allChildrenLen += colChildrenLen;
                    allChildrenWidthSum += colWidth;
                }
                return [allChildrenLen, allChildrenWidthSum];
            }

            flat(copyColumn as PrivateStkTableColumn<PrivateRowDT>[], null);
            tableHeadersRef.current = tableHeadersTemp;
            tableHeadersForCalcRef.current = tableHeadersForCalcTemp;
        },
        [isRelativeMode],
    );

    return { tableHeadersRef, tableHeadersForCalcRef, dealColumns };
}
