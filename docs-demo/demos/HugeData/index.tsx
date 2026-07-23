import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import mockjs from 'mockjs';
import { StkTable } from '../../StkTable';
import type { StkTableRef, StkTableColumn, Order, SortConfig, SortState } from '../../../src/StkTable/index';
import { insertToOrderedArray, tableSort } from '../../../src/StkTable/index';
import CheckItem from '../../components/CheckItem';
import RadioGroup from '../../components/RadioGroup';
import RangeInput from '../../components/RangeInput';
import { useI18n } from '../../hooks/useI18n/index';
import { columns as columnsRaw } from './columns';
import { emitter } from './event';
import { mockData } from './mockData';
import type { DataType } from './types';

const { Random } = mockjs;

const RATING_OPTIONS = ['AAA', 'AA+', 'AA-', 'AA', 'B+', 'B'];
const CODE_BASE = 10_000_000;
const createData = (i: number) => {
    return {
        code: CODE_BASE + i,
        bestBuyVol: Random.integer(1, 6) * 1000,
        bestSellVol: Random.integer(1, 6) * 1000,
        source: Random.integer(1, 6),
        lastPrice: (Math.random() * 15 + 5).toFixed(4),
        cbOfrBp: (Math.random() * 10).toFixed(4),
        bestBuyPrice: (Math.random() * 10).toFixed(4),
        bestSellPrice: (Math.random() * 10).toFixed(4),
        orgDebtRating: RATING_OPTIONS[Math.floor(Math.random() * RATING_OPTIONS.length)],
    };
};

export default function HugeData() {
    const { t, isZH } = useI18n();
    const stkTableRef = useRef<StkTableRef<DataType>>(null);

    const sortConfig = useMemo<SortConfig<DataType>>(
        () => ({
            defaultSort: {
                dataIndex: 'bestTime' as keyof DataType,
                order: 'desc' as Order,
                sortType: 'string' as 'string' | 'number' | undefined,
            },
        }),
        [],
    );

    const currentSortRef = useRef<SortState<DataType>>({
        dataIndex: 'bestTime',
        order: 'desc',
        sortType: 'string',
    });

    // ---- render state ----
    const [dataSize, setDataSize] = useState(50000);
    const [rowByRow, setRowByRow] = useState(false);
    const [optimizeDragScroll, setOptimizeDragScroll] = useState<'scrollbar' | undefined>();
    const [translateZ, setTranslateZ] = useState(false);
    const [updateFreq, setUpdateFreq] = useState(1000);
    const [scrollbar, setScrollbar] = useState(true);
    const [areaSelection, setAreaSelection] = useState(true);
    const [experimentalScrollY, setExperimentalScrollY] = useState(false);
    const [showFooter, setShowFooter] = useState(false);
    const [rowSpanOn, setRowSpanOn] = useState(false);
    const [colSpanOn, setColSpanOn] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [columns, setColumns] = useState<StkTableColumn<DataType>[]>(() => columnsRaw(t));
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [footerData, setFooterData] = useState<Record<string, any>[]>([]);

    // ---- refs for async callbacks ----
    const dataSourceRef = useRef<DataType[]>([]);
    const dataSizeRef = useRef(dataSize);
    const updateFreqRef = useRef(updateFreq);
    const showFooterRef = useRef(showFooter);
    const timeoutRef = useRef(0);
    const tRef = useRef(t);
    dataSizeRef.current = dataSize;
    updateFreqRef.current = updateFreq;
    showFooterRef.current = showFooter;
    tRef.current = t;

    // computed once with the initial language (mirrors Vue setup behaviour)
    const mockDataResult = useMemo(() => mockData(isZH), []); // eslint-disable-line react-hooks/exhaustive-deps

    const commitDataSource = useCallback((newArr: DataType[]) => {
        dataSourceRef.current = newArr;
        setDataSource(newArr);
    }, []);

    const calculateFootData = useCallback(() => {
        const ds = dataSourceRef.current;
        if (ds.length === 0 || !showFooterRef.current) {
            setFooterData([]);
            return;
        }
        const totals: Record<string, any> = {};
        const numericFields = ['bestBuyVol', 'bestSellVol', 'lastPrice', 'cbOfrBp', 'bestBuyPrice', 'bestSellPrice'];
        numericFields.forEach(field => {
            const sum = ds.reduce((acc, row) => {
                const value = parseFloat(row[field as keyof DataType] as string) || 0;
                return acc + value;
            }, 0);
            totals[field] = sum.toFixed(2);
        });
        totals.seq = tRef.current('Summary');
        totals.bestTime = `${tRef.current('Total')} ${ds.length} ${tRef.current('records')}`;
        setFooterData([totals]);
    }, []);

    const initDataSource = useCallback(() => {
        const curDate = new Date();
        const curHour = curDate.getHours();
        const curMinute = curDate.getMinutes();
        const dataSourceTemp = Array.from({ length: dataSizeRef.current }).map((_, index) => {
            const data = Object.assign({}, mockDataResult, createData(index)) as any;
            data.bestTime =
                String(Random.integer(0, curHour)).padStart(2, '0') +
                ':' +
                String(Random.integer(0, Math.max(curMinute - 1, 0))).padStart(2, '0') +
                ':' +
                String(Random.integer(0, 59)).padStart(2, '0') +
                '.' +
                String(Random.integer(0, 999)).padStart(3, '0');
            return data;
        });

        const sorted = tableSort({ dataIndex: 'bestTime', sorter: true }, 'desc', dataSourceTemp, sortConfig);
        commitDataSource(sorted);
        calculateFootData();
    }, [mockDataResult, sortConfig, commitDataSource, calculateFootData]);

    const highlightRow = useCallback((row: DataType) => {
        setTimeout(() => {
            const key = row.code;
            stkTableRef.current?.setHighlightDimRow([key]);
        }, 0);
    }, []);

    const simulateUpdateData = useCallback((): void => {
        timeoutRef.current = window.setTimeout(() => {
            simulateUpdateDataRef.current();
            const curDate = new Date();
            const curHour = curDate.getHours();
            const curMinute = curDate.getMinutes();
            const curSeconds = curDate.getSeconds();
            const curMilliseconds = curDate.getMilliseconds();
            const newData: any = {
                ...mockDataResult,
                ...createData(Random.integer(0, dataSourceRef.current.length - 1)),
                bestTime:
                    String(curHour).padStart(2, '0') +
                    ':' +
                    String(curMinute).padStart(2, '0') +
                    ':' +
                    String(curSeconds).padStart(2, '0') +
                    '.' +
                    String(curMilliseconds).padStart(3, '0'),
            };
            const rowIndex = dataSourceRef.current.findIndex(item => item.code === newData.code);
            if (rowIndex === -1) return;
            const ds = dataSourceRef.current.slice();
            ds.splice(rowIndex, 1); // delete old data
            // binary insert
            const newArr = insertToOrderedArray(currentSortRef.current, newData, ds);
            commitDataSource(newArr);
            highlightRow(newData);
            calculateFootData();
        }, updateFreqRef.current);
    }, [mockDataResult, commitDataSource, highlightRow, calculateFootData]);

    const simulateUpdateDataRef = useRef(simulateUpdateData);
    simulateUpdateDataRef.current = simulateUpdateData;

    const stopSimulateUpdateData = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = 0;
        }
        setIsRunning(false);
    }, []);

    const handleToggleExpand = useCallback(
        (row: DataType) => {
            const ds = dataSourceRef.current;
            const expand = !row._isExpand;
            const rowIndex = ds.findIndex(item => item.code === row.code);
            if (rowIndex === -1) {
                console.error('can not expand:', row);
                return;
            }
            const newDs = ds.slice();
            if (expand) {
                const insertRows: DataType[] = [...new Array(6).fill(null)].map((_, index) => {
                    return {
                        _isChildren: true, // mark as child node
                        code: Random.guid(),
                        source: index + 1,
                        bestBuyVol: Random.integer(1, 6) * 1000,
                        bestSellVol: Random.integer(1, 6) * 1000,
                        lastPrice: Random.float(1, 20, 4, 4),
                        cbOfrBp: Random.float(0, 10, 4, 4),
                        bestBuyPrice: Random.float(0, 10, 4, 4),
                        bestSellPrice: Random.float(0, 10, 4, 4),
                    } as any;
                });
                newDs.splice(rowIndex + 1, 0, ...insertRows);
            } else {
                newDs.splice(rowIndex + 1, 6);
            }
            newDs[rowIndex] = { ...newDs[rowIndex], _isExpand: expand }; // trigger row update
            commitDataSource(newDs); // trigger table update
            calculateFootData();
        },
        [commitDataSource, calculateFootData],
    );

    // register emitter
    useEffect(() => {
        emitter.on('toggle-expand', handleToggleExpand);
        return () => {
            emitter.off('toggle-expand', handleToggleExpand);
        };
    }, [handleToggleExpand]);

    // init on mount
    useEffect(() => {
        initDataSource();
        simulateUpdateDataRef.current();
        setIsRunning(true);
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = 0;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleToggleSimulate() {
        if (timeoutRef.current) {
            stopSimulateUpdateData();
        } else {
            simulateUpdateDataRef.current();
            setIsRunning(true);
        }
    }

    function handleSortChange(
        col: StkTableColumn<DataType> | null,
        order: Order,
        data: DataType[],
        sortConfigArg: SortConfig<DataType>,
    ) {
        if (col) {
            currentSortRef.current.dataIndex = col.dataIndex;
            currentSortRef.current.sortType = col.sortType;
        }
        currentSortRef.current.order = order;
        const sorted = tableSort(col ?? { dataIndex: currentSortRef.current.dataIndex }, order, data, sortConfigArg);
        commitDataSource(sorted);
        calculateFootData();
    }

    function handleDataSizeChange(e: ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value);
        if (isNaN(value)) return;
        setDataSize(value);
        dataSizeRef.current = value;
        initDataSource();
    }

    function handleDataSizeRadio(value: number | undefined) {
        if (value === undefined) return;
        setDataSize(value);
        dataSizeRef.current = value;
        initDataSource();
    }

    function handleOptimizeScrollChange(v: boolean) {
        if (v) {
            setOptimizeDragScroll('scrollbar');
            setRowByRow(false);
        } else {
            setOptimizeDragScroll(void 0);
        }
    }

    function handleRowSpan(v: boolean) {
        setRowSpanOn(v);
        setColumns(prev =>
            prev.map(col => {
                if (col.dataIndex !== 'code') return col;
                return {
                    ...col,
                    mergeCells: v ? ({ rowIndex }: any) => ({ rowspan: rowIndex % 2 ? 1 : 2 }) : void 0,
                };
            }),
        );
    }

    function handleColSpan(v: boolean) {
        setColSpanOn(v);
        setColumns(prev =>
            prev.map(col => {
                if (col.dataIndex !== 'bondAbbreviation') return col;
                return {
                    ...col,
                    mergeCells: v ? ({ rowIndex }: any) => ({ colspan: rowIndex % 2 ? 1 : 2 }) : void 0,
                };
            }),
        );
    }

    function handleShowFooterChange(v: boolean) {
        setShowFooter(v);
        showFooterRef.current = v;
        calculateFootData();
    }

    return (
        <>
            <div className="row">
                <RadioGroup
                    value={dataSize}
                    text={t('dataAmount')}
                    options={[
                        { label: '1k', value: 1000 },
                        { label: '5k', value: 5000 },
                        { label: isZH ? '1w' : '10k', value: 10000 },
                        { label: isZH ? '5w' : '50k', value: 50000 },
                        { label: isZH ? '10w' : '100k', value: 100_000 },
                        { label: isZH ? '50w' : '500k', value: 500_000 },
                        { label: isZH ? '100w' : '1mln', value: 1_000_000 },
                    ]}
                    onChange={handleDataSizeRadio}
                ></RadioGroup>
                <input
                    className="input"
                    value={dataSize}
                    type="number"
                    style={{ width: 70, marginLeft: 6 }}
                    onChange={handleDataSizeChange}
                />
            </div>
            <button className="btn" onClick={handleToggleSimulate}>
                {t('simulateUpdateData')}({isRunning ? t('stop') : t('start')})
            </button>
            <label style={{ marginLeft: 16 }}>
                <RangeInput value={updateFreq} onChange={setUpdateFreq} min={16} max={1000} label={t('freq')} suffix="ms" />
            </label>
            <CheckItem checked={rowByRow} onChange={setRowByRow} text={t('rowByRowScroll')} />
            <CheckItem checked={translateZ} onChange={setTranslateZ} text={t('translateZ')} />
            <CheckItem checked={optimizeDragScroll === 'scrollbar'} text={t('optimizeDragScroll')} onChange={handleOptimizeScrollChange} />
            <CheckItem checked={rowSpanOn} text={t('rowspanTest')} onChange={handleRowSpan} />
            <CheckItem checked={colSpanOn} text={t('colspanTest')} onChange={handleColSpan} />
            <CheckItem checked={scrollbar} onChange={setScrollbar} text="scrollbar" />
            <CheckItem checked={areaSelection} onChange={setAreaSelection} text="areaSelection" />
            <CheckItem checked={experimentalScrollY} onChange={setExperimentalScrollY} text="experimentalScrollY" />
            <CheckItem checked={showFooter} text={t('showFooter')} onChange={handleShowFooterChange} />
            <StkTable
                ref={stkTableRef}
                columns={columns}
                className={translateZ ? 'stack' : ''}
                style={{ height: 700 }}
                rowKey="code"
                noDataFull
                fixedColShadow
                virtual
                virtualX
                showOverflow
                showHeaderOverflow
                stripe
                colResizable
                sortRemote
                areaSelection={{
                    enabled: areaSelection,
                    keyboard: areaSelection,
                }}
                scrollbar={scrollbar}
                experimental={{ scrollY: experimentalScrollY }}
                scrollRowByRow={rowByRow || optimizeDragScroll}
                sortConfig={sortConfig}
                emptyCellText={({ row }: any) => (row._isChildren ? '' : '--')}
                rowClassName={(row: DataType) => (row._isChildren ? 'child-row' : '')}
                dataSource={dataSource}
                footerData={showFooter ? (footerData as any) : undefined}
                onSortChange={handleSortChange}
            ></StkTable>
            <style>{`
                .row { display: flex; }
                .stack .stk-tbody-main tr { transform: translateZ(0); }
                .blue-cell { color: #4f8df4; }
                .red-cell { color: #ff2b48; }
                .green-cell { color: #2fc87b; }
                .source-cell {
                    border-radius: 4px;
                    background-color: #777;
                    display: inline-block;
                    padding: 0 8px;
                    font-size: 14px;
                    line-height: 20px;
                }
                .source-cell.source-1 { background-color: rgba(39, 69, 159, 0.4); }
                .source-cell.source-2 { background-color: rgba(171, 99, 0, 0.4); }
                .source-cell.source-3 { background-color: rgba(0, 119, 143, 0.4); }
                .source-cell.source-4 { background-color: rgba(171, 28, 0, 0.4); }
                .source-cell.source-5 { background-color: rgba(199, 166, 0, 0.4); }
                .source-cell.source-6 { background-color: rgba(113, 23, 204, 0.4); }
                .stk-table { --child-bgc: #f6f6f6; }
                .stk-table.dark { --child-bgc: #303039; }
                .stk-table.stripe.vt-on .stk-tbody-main .child-row { background-color: var(--child-bgc); }
                .stk-table.stripe.vt-on .stk-tbody-main .child-row.active { background-color: var(--tr-active-bgc); }
                .stk-table.stripe.vt-on .stk-tbody-main .child-row:hover { background-color: var(--tr-hover-bgc); }
            `}</style>
        </>
    );
}
