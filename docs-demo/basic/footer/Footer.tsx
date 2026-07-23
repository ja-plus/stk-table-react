import { useMemo } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

type Data = {
    seq?: string;
    name: string;
    age: number;
    salary: number;
    bonus: number;
};

const columns: StkTableColumn<Data>[] = [
    { type: 'seq', title: 'No.', dataIndex: 'seq' as any, width: 70 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age', align: 'right' },
    { title: 'Salary', dataIndex: 'salary', align: 'right' },
    { title: 'Bonus', dataIndex: 'bonus', align: 'right' },
];

const dataSource: Data[] = [
    { name: 'Jack', age: 18, salary: 5000, bonus: 1000 },
    { name: 'Tom', age: 20, salary: 6000, bonus: 1500 },
    { name: 'Lucy', age: 22, salary: 7000, bonus: 2000 },
    { name: 'Lily', age: 24, salary: 8000, bonus: 2500 },
    // 100 rows
    ...Array.from({ length: 100 }, (_, i) => ({
        name: `User${i}`,
        age: 20 + i,
        salary: 5000 + i * 100,
        bonus: 1000 + i * 50,
    })),
];

export default function Footer() {
    const { t } = useI18n();

    // 动态计算合计
    const footerData = useMemo<Data[]>(() => {
        if (dataSource.length === 0) return [];
        const totals: Data = { seq: t('Total'), name: '', age: 0, salary: 0, bonus: 0 };
        // 计算数值字段的总和
        dataSource.forEach(row => {
            totals.age += row.age;
            totals.salary += row.salary;
            totals.bonus += row.bonus;
        });
        return [
            totals,
            {
                seq: t('Average'),
                name: '',
                age: parseFloat((totals.age / dataSource.length).toFixed(2)),
                salary: parseFloat((totals.salary / dataSource.length).toFixed(2)),
                bonus: parseFloat((totals.bonus / dataSource.length).toFixed(2)),
            },
        ];
    }, [t]);

    return <StkTable style={{ height: '300px' }} rowKey="name" columns={columns} dataSource={dataSource} footerData={footerData} />;
}
