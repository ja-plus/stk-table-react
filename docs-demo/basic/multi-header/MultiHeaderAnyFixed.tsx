import { useEffect, useRef } from 'react';
import { StkTable } from '../../StkTable';
import type { StkTableColumn, StkTableRef } from '../../../src/StkTable';
import { useI18n } from '../../hooks/useI18n';

const dataSource = new Array(50).fill(0).map((it, i) => {
    return {
        id: i,
        lv2_1: 'lv2.1',
        lv2_2: 'lv2.2',
        age: i,
        email: i + '@email.com',
    };
});

export default function MultiHeaderAnyFixed() {
    const { t } = useI18n();
    const stkTableRef = useRef<StkTableRef<any>>(null);

    const columns: StkTableColumn<any>[] = [
        {
            dataIndex: 'Basic',
            title: t('basic'),
            fixed: 'left',
            children: [
                { dataIndex: 'id', title: t('id'), width: 100, fixed: 'left' },
                {
                    dataIndex: 'lv2',
                    title: t('lv2'),
                    width: 100,
                    children: [
                        { dataIndex: 'lv2_1', title: t('lv2_1'), width: 100 },
                        { dataIndex: 'lv2_2', title: t('lv2_2'), width: 100, fixed: 'left' },
                    ],
                },
            ],
        },
        {
            dataIndex: 'age',
            title: t('age'),
            width: '50px',
            children: [
                { dataIndex: 'id3', title: t('id'), width: 50 },
                {
                    dataIndex: 'lv5',
                    title: t('lv2'),
                    width: 100,
                },
            ],
        },
        { dataIndex: 'email', title: t('email'), width: '130px', fixed: 'left' },
        {
            dataIndex: 'other',
            title: t('other'),
        },
        {
            dataIndex: 'right',
            title: t('right'),
            fixed: 'right',
            children: [
                { dataIndex: 'right-1', title: t('right1'), width: 50 },
                { dataIndex: 'right-2', title: t('right2'), width: 100, fixed: 'right' },
            ],
        },
    ];

    useEffect(() => {
        stkTableRef.current?.scrollTo(0, 100);
    }, []);

    return <StkTable ref={stkTableRef} style={{ height: '200px' }} rowKey="id" fixedColShadow virtual columns={columns} dataSource={dataSource} />;
}
