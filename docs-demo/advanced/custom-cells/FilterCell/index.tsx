import { useMemo, useState } from 'react';
import { StkTable } from '../../../StkTable';
import { createFilterCell } from '../../../../src/StkTable/index';
import type { StkTableColumn } from '../../../../src/StkTable/index';
import { useI18n } from '../../../hooks/useI18n/index';

interface RowData {
    id: number;
    name: string;
    city: string;
    department: string;
}

export default function FilterCellDemo() {
    const { t } = useI18n();

    const [dataSource] = useState<RowData[]>([
        { id: 1, name: t('zhangSan'), city: t('beijing'), department: t('techDept') },
        { id: 2, name: t('liSi'), city: t('shanghai'), department: t('productDept') },
        { id: 3, name: t('wangWu'), city: t('beijing'), department: t('techDept') },
        { id: 4, name: t('zhaoLiu'), city: t('guangzhou'), department: t('opsDept') },
        { id: 5, name: t('sunQi'), city: t('shanghai'), department: t('techDept') },
        { id: 6, name: t('zhouBa'), city: t('shenzhen'), department: t('productDept') },
    ]);

    const { Filter } = useMemo(() => createFilterCell(), []);

    const columns: StkTableColumn<RowData>[] = useMemo(() => {
        const NameFilter = Filter({
            options: [
                { label: t('zhangSan'), value: t('zhangSan') },
                { label: t('liSi'), value: t('liSi') },
                { label: t('wangWu'), value: t('wangWu') },
            ],
        });
        const CityFilter = Filter({ autoOptions: true });
        const DepartmentFilter = Filter({
            options: [
                { label: t('techDept'), value: t('techDept') },
                { label: t('productDept'), value: t('productDept') },
                { label: t('opsDept'), value: t('opsDept') },
            ],
        });

        return [
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: t('name'), dataIndex: 'name', customHeaderCell: NameFilter },
            { title: t('city'), dataIndex: 'city', customHeaderCell: CityFilter },
            { title: t('department'), dataIndex: 'department', customHeaderCell: DepartmentFilter },
        ];
    }, [Filter, t]);

    return <StkTable columns={columns} dataSource={dataSource} rowKey="id" />;
}
