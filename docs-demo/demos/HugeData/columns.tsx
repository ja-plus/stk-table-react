import type { StkTableColumn, CustomHeaderCellProps } from '../../../src/StkTable/index';
import { createFilterCell } from '../../../src/StkTable/index';
import ExpandCell from './custom-cells/ExpandCell';
import SourceCell from './custom-cells/SourceCell';
import type { DataType } from './types';

const { Filter, filterStatus } = createFilterCell();

function BestBuyVolHeader(props: CustomHeaderCellProps<DataType>) {
    return <span>{props.col.title + `(${filterStatus.current.bestBuyVol?.value || '-'})`}</span>;
}

export const columns: (t: (key: string, defaultValue?: string) => string) => StkTableColumn<DataType>[] = t => {
    return [
        { type: 'seq', dataIndex: 'seq' as any, title: t('seq'), fixed: 'left', width: 70 },
        {
            dataIndex: 'source',
            title: t('source'),
            width: 70,
            sortField: 'source',
            align: 'center',
            fixed: 'left',
            customCell: props => {
                if (props.row._isChildren) {
                    return <SourceCell {...props} />;
                }
                return <ExpandCell {...props} />;
            },
        },
        {
            dataIndex: 'code',
            title: t('code'),
            sortField: 'thsCode',
        },
        {
            dataIndex: 'bondAbbreviation',
            title: t('abbreviation'),
            width: 130,
            fixed: 'left',
        },
        { dataIndex: 'remainingPeriod', title: t('remainingPeriod') },
        {
            dataIndex: 'bestBuyVol',
            sortType: 'number',
            title: t('buyVolume'),
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            customHeaderCell: Filter(
                {
                    options: [
                        { label: '3000', value: 3000 },
                        { label: '4000', value: 4000 },
                        { label: '2000', value: 2000 },
                    ],
                },
                BestBuyVolHeader,
            ),
        },
        {
            dataIndex: 'bestBuyPrice',
            title: 'Bid',
            className: 'red-cell',
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            sortType: 'number',
            customHeaderCell: Filter({
                options: [
                    { label: '<1', value: 1 },
                    { label: '1-2', value: 2 },
                    { label: '>2', value: 3 },
                ],
                filter({ cellValue, filterValues }) {
                    return filterValues.some(fv => {
                        if (fv === 1) {
                            return cellValue < 1;
                        }
                        if (fv === 2) {
                            return cellValue >= 1 && cellValue < 2;
                        }
                        return cellValue >= 2;
                    });
                },
            }),
        },
        {
            dataIndex: 'bestSellPrice',
            title: 'Ofr',
            className: 'green-cell',
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            sortType: 'number',
        },
        {
            dataIndex: 'bestSellVol',
            sortType: 'number',
            title: t('sellVolume'),
            align: 'right',
            headerAlign: 'right',
            sorter: true,
            customHeaderCell: Filter({
                options: [
                    { label: '5000', value: 5000 },
                    { label: '4000', value: 4000 },
                ],
            }),
        },
        {
            dataIndex: 'lastPrice',
            title: t('transaction'),
            className: 'blue-cell',
            align: 'right',
            headerAlign: 'right',
            sortType: 'number',
            sorter: true,
        },
        {
            dataIndex: 'couponRate',
            sortType: 'number',
            title: t('couponRate'),
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'bestTime',
            title: t('time'),
            sortField: 'bestTime',
            align: 'center',
            sorter: true,
            width: 120,
            fixed: 'left',
        },
        {
            dataIndex: 'orgDebtRating',
            title: t('mainDebtRating'),
            customHeaderCell: Filter({ autoOptions: true }),
        },
        { dataIndex: 'cbImpliedRating', title: t('impliedRatingCnBond'), width: 120 },
        { dataIndex: 'csiImpliedRating', title: t('impliedRatingCsi'), width: 120 },
        { dataIndex: 'outlook', title: t('outlook'), sortField: 'outlook' },
        { dataIndex: 'entitlementType', title: t('entitlementType') },
        { dataIndex: 'nextExerciseDate', title: t('nextExerciseDate') },
        { dataIndex: 'expiryDate', title: t('expiryDate') },
        { dataIndex: 'issueWay', title: t('issueWay') },
        { dataIndex: 'crossMarket', title: t('crossMarket') },
        { dataIndex: 'industry', title: t('industry') },
        { dataIndex: 'ratingOrg', title: t('ratingOrg') },
        { dataIndex: 'bondType', title: t('bondType') },
        { dataIndex: 'orgName', title: t('issuer'), sortField: 'orgName', width: 180 },
        {
            dataIndex: 'bestBidNetPrice',
            sortType: 'number',
            title: t('bidReferenceNetPrice'),
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'bestOfrNetPrice',
            sortType: 'number',
            title: t('ofrReferenceNetPrice'),
            align: 'right',
            headerAlign: 'right',
        },
        { dataIndex: 'bestBidClearingSpeed', title: t('bidClearingSpeed') },
        { dataIndex: 'bestOfrClearingSpeed', title: t('ofrClearingSpeed') },
        {
            dataIndex: 'cbValue',
            sortType: 'number',
            title: t('cnBondValuation'),
            sortField: 'cbValuation',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'lastDealCbBp',
            sortType: 'number',
            title: t('transactionCnBondBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'cbNetPriceStr',
            sortType: 'number',
            title: t('netPriceCnBond'),
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'cbDurationStr',
            sortType: 'number',
            title: t('durationCnBond'),
            sortField: 'cbDuration',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'csiValue',
            sortType: 'number',
            title: t('csiValuation'),
            sortField: 'csiValuation',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'lastDealCsiBp',
            sortType: 'number',
            title: t('transactionCsiBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'csiNetPriceStr',
            sortType: 'number',
            title: t('netPriceCsi'),
            sortField: 'csiNetPrice',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'csiCbStr',
            sortType: 'number',
            title: t('csiCnBond'),
            sortField: 'csiCbBp',
            align: 'right',
            headerAlign: 'right',
        },
        {
            dataIndex: 'bestBidCbBp',
            sortType: 'number',
            title: t('bidCnBondBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'bestCbOfrBp',
            sortType: 'number',
            title: t('cnBondOfrBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'bestBidCsiBp',
            sortType: 'number',
            title: t('bidCsiBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
        {
            dataIndex: 'bestCsiOfrBp',
            sortType: 'number',
            title: t('csiOfrBp'),
            align: 'right',
            headerAlign: 'right',
            width: 120,
        },
    ];
};
