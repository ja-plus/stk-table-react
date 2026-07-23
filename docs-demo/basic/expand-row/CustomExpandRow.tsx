import { useRef, useState } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef, CustomCellProps } from '../../../src/StkTable';
import CheckItem from '../../components/CheckItem';
import { useI18n } from '../../hooks/useI18n/index';

const data = new Array(100).fill(0).map((it, index) => {
    return {
        id: index,
        name: 'name' + index,
        address: 'sss',
        email: 'email' + index + '@example.com',
        phone: '123-456-7890',
        website: 'www.example.com',
        company: 'Company' + index,
        catchPhrase: 'Catch Phrase' + index,
        bs: 'BS' + index,
    };
});

export default function CustomExpandRow() {
    const { t } = useI18n();

    const [virtual, setVirtual] = useState(false);
    const stkTableRef = useRef<StkTableRef<any>>(null);

    function handleCustomCellClick(row: any, col: StkTableColumn<any>) {
        stkTableRef.current?.setRowExpand(row, null, { col, silent: true });
    }

    const NameCell = (props: CustomCellProps<any>) => {
        let className = 'custom-expand-icon';
        if (props.expanded && props.expanded.dataIndex === 'name') {
            className += ' custom-expand-icon-active';
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => handleCustomCellClick(props.row, props.col)}>
                <span className={className} />
                <span>{props.cellValue}</span>
            </div>
        );
    };

    const columns: StkTableColumn<any>[] = [
        { type: 'expand', dataIndex: '' as any, width: 50, align: 'center', fixed: 'left' },
        {
            type: 'expand',
            dataIndex: 'name',
            title: t('customExpandRow'),
            width: 80,
            customCell: NameCell,
        },
        { dataIndex: 'id', title: t('id') + '(100px)', width: '100px' },
        { dataIndex: 'address', title: t('address') },
        { dataIndex: 'email', title: t('email') },
        { dataIndex: 'phone', title: t('phone') },
        { dataIndex: 'website', title: t('website') },
        { dataIndex: 'company', title: t('company') },
        { dataIndex: 'catchPhrase', title: t('catchPhrase') },
        { dataIndex: 'bs', title: t('bs') },
    ];

    function handleToggleRowExpand(d: any) {
        console.log('handleToggleRowExpand', d);
    }

    return (
        <div>
            <style>{`
                .stk-table .custom-expand-icon { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-right: 6px; display: inline-flex; justify-content: center; align-items: center; border: 1px solid; transition: all 0.2s ease; }
                .stk-table .custom-expand-icon-active { background-color: #1890ff; color: #fff; transform: rotate(90deg); }
            `}</style>
            <CheckItem checked={virtual} onChange={setVirtual} text={t('virtual')} />
            <StkTable
                ref={stkTableRef}
                rowKey="id"
                style={{ height: '400px' }}
                virtual={virtual}
                expandConfig={{ height: 80 }}
                columns={columns}
                dataSource={data}
                onToggleRowExpand={handleToggleRowExpand}
                renderExpand={(row, col) => (
                    <div>
                        <div>trigger: {col.title || '--'}</div>
                        <p>
                            id: {row.id}, phone: {row.phone}
                        </p>
                        <p>name: {row.name}</p>
                        <p>website: {row.website}</p>
                    </div>
                )}
            />
        </div>
    );
}
