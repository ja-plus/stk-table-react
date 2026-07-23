import { useMemo, useState } from 'react';
import { StkTable } from '../../../StkTable';
import { createFilterCell } from '../../../../src/StkTable/index';
import type { StkTableColumn } from '../../../../src/StkTable/index';
import { useI18n } from '../../../hooks/useI18n/index';

interface RowData {
    id: number;
    name: string;
    age: number;
    score: number;
}

export default function CustomFilterDemo() {
    const { t } = useI18n();

    const [dataSource] = useState<RowData[]>([
        { id: 1, name: t('zhangSan'), age: 25, score: 88 },
        { id: 2, name: t('liSi'), age: 32, score: 72 },
        { id: 3, name: t('wangWu'), age: 28, score: 95 },
        { id: 4, name: t('zhaoLiu'), age: 45, score: 60 },
        { id: 5, name: t('sunQi'), age: 22, score: 81 },
        { id: 6, name: t('zhouBa'), age: 38, score: 54 },
    ]);

    const { Filter } = useMemo(() => createFilterCell(), []);

    const columns: StkTableColumn<RowData>[] = useMemo(() => {
        const AgeFilter = Filter({
            options: [
                { label: t('under30'), value: 'young' },
                { label: t('over30'), value: 'old' },
            ],
            filter: ({ cellValue, filterValues }) => {
                return filterValues.some(v => {
                    if (v === 'young') return cellValue < 30;
                    if (v === 'old') return cellValue >= 30;
                    return false;
                });
            },
        });

        const ScoreFilter = Filter({
            options: [
                { label: t('excellent'), value: 'A' },
                { label: t('good'), value: 'B' },
                { label: t('fail'), value: 'C' },
            ],
            filter: ({ cellValue, filterValues }) => {
                return filterValues.some(v => {
                    if (v === 'A') return cellValue >= 90;
                    if (v === 'B') return cellValue >= 60 && cellValue < 90;
                    if (v === 'C') return cellValue < 60;
                    return false;
                });
            },
        });

        return [
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: t('name'), dataIndex: 'name' },
            { title: t('age'), dataIndex: 'age', customHeaderCell: AgeFilter },
            { title: t('score'), dataIndex: 'score', customHeaderCell: ScoreFilter },
        ];
    }, [Filter, t]);

    return <StkTable columns={columns} dataSource={dataSource} rowKey="id" />;
}
