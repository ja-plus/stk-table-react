import { useMemo, useState } from 'react';
import { StkTable } from '../../../StkTable';
import { createEditableCell } from '../../../../src/StkTable/index';
import type { StkTableColumn } from '../../../../src/StkTable/index';
import { useI18n } from '../../../hooks/useI18n/index';

interface RowData {
    id: number;
    name: string;
    age: number;
    address: string;
}

export default function EditableCellDemo() {
    const { t } = useI18n();

    const [dataSource] = useState<RowData[]>([
        { id: 1, name: t('zhangSan'), age: 28, address: t('haidian') },
        { id: 2, name: t('liSi'), age: 32, address: t('pudong') },
        { id: 3, name: t('wangWu'), age: 25, address: t('tianhe') },
    ]);

    const { EditableCell } = useMemo(
        () =>
            createEditableCell({
                onChange: (newValue, row, dataIndex) => {
                    console.log(t('valueChange'), { newValue, row, dataIndex });
                },
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const columns: StkTableColumn<RowData>[] = useMemo(
        () => [
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: t('name'), dataIndex: 'name', width: 100, customCell: EditableCell },
            { title: t('age'), dataIndex: 'age', width: 80, customCell: EditableCell },
            { title: t('address'), dataIndex: 'address', customCell: EditableCell },
        ],
        [EditableCell, t],
    );

    return (
        <StkTable
            rowKey="id"
            cellHover
            cellActive
            selectedCellRevokable={false}
            rowActive={false}
            rowHover={false}
            columns={columns}
            dataSource={dataSource}
        />
    );
}
