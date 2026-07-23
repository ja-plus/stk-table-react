import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

type DataType = { key: string; name: string; rate: string };

const RATE_ARR = ['D', 'C', 'B-', 'B', 'B+', 'BB', 'BBB', 'A-', 'A', 'A+', 'AA', 'AA+', 'AAA'];

const customRateSorter: StkTableColumn<DataType>['sorter'] = (data, { column, order }) => {
    const key = column.dataIndex as keyof DataType;
    if (order === 'desc') {
        data.sort((a, b) => RATE_ARR.indexOf(b[key]) - RATE_ARR.indexOf(a[key]));
    } else if (order === 'asc') {
        data.sort((a, b) => RATE_ARR.indexOf(a[key]) - RATE_ARR.indexOf(b[key]));
    }
    return data;
};

export default function CustomSort() {
    const { t } = useI18n();
    const columns: StkTableColumn<DataType>[] = [
        { title: t('seq'), dataIndex: '' as any, type: 'seq', width: 50 },
        { title: t('name'), dataIndex: 'name', sorter: true },
        { title: t('rate'), dataIndex: 'rate', sorter: customRateSorter },
    ];
    const dataSource: DataType[] = Array.from({ length: 100 }, (_, i) => ({
        key: String(i),
        name: `Name ${i}`,
        rate: RATE_ARR[Math.floor(Math.random() * RATE_ARR.length)],
    }));
    return <StkTable style={{ height: 200 }} rowKey="key" columns={columns} dataSource={dataSource} />;
}
